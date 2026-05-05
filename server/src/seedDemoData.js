/**
 * seedDemoData.js — BugPilot idempotent demo seed
 *
 * Safe to run multiple times: uses find-or-create logic — never duplicates records.
 * Does NOT modify existing user passwords.
 *
 * Usage:
 *   cd server && npm run seed:demo
 */

import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./modules/auth/auth.model.js";
import Bug from "./modules/bugs/bug.model.js";
import Story from "./modules/stories/story.model.js";
import Task from "./modules/tasks/task.model.js";
import Comment from "./modules/comments/comment.model.js";
import Attachment from "./modules/attachments/attachment.model.js";
import Activity from "./modules/admin/activity.model.js";

// ---------------------------------------------------------------------------
// Helper: find-or-create (never overwrites, never duplicates)
// ---------------------------------------------------------------------------
const findOrCreate = async (Model, query, defaults) => {
  const existing = await Model.findOne(query);
  if (existing) return { doc: existing, created: false };
  const doc = await Model.create({ ...defaults });
  return { doc, created: true };
};

const logLine = (label, created, total) => {
  const existed = total - created;
  const parts = [];
  if (created > 0) parts.push(`${created} created`);
  if (existed > 0) parts.push(`${existed} already existed`);
  console.log(`  ${label.padEnd(14)} ${parts.join(", ")} (${total} total)`);
};

// ---------------------------------------------------------------------------
// Demo users — passwords only used if the user does NOT already exist.
// Existing users are never touched except to correct their role if wrong.
// ---------------------------------------------------------------------------
const USER_DEFS = [
  {
    email: "mohamedhammad3.142@gmail.com",
    name: "Mohamed Hammad",
    password: "12345678",
    role: "TESTER",
  },
  {
    email: "joenasr@gmail.com",
    name: "Joe Nasr",
    password: "Joe12345678",
    role: "CUSTOMER",
  },
  {
    email: "admin@test.com",
    name: "Demo Admin",
    password: "12345678",
    role: "ADMIN",
  },
  {
    email: "devlead@test.com",
    name: "Demo Dev Lead",
    password: "DevLead12345678",
    role: "DEVELOPER",
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const seed = async () => {
  await connectDB();
  console.log("\n🌱  BugPilot Demo Seed — starting...\n");

  // ── 1. Users ──────────────────────────────────────────────────────────────
  const userMap = {}; // keyed by role
  let usersCreated = 0;

  for (const def of USER_DEFS) {
    let user = await User.findOne({ email: def.email });

    if (user) {
      // Correct role if it doesn't match — demo seed can safely set the right role.
      // This will NOT run for the real admin/tester users if their role is already correct.
      if (user.role !== def.role) {
        await User.findByIdAndUpdate(user._id, { role: def.role });
        user = await User.findById(user._id);
      }
    } else {
      const hashedPassword = await bcrypt.hash(def.password, 12);
      user = await User.create({
        email: def.email,
        name: def.name,
        password: hashedPassword,
        role: def.role,
        isActive: true,
      });
      usersCreated++;
    }

    userMap[def.role] = user;
  }

  logLine("Users", usersCreated, USER_DEFS.length);

  const tester = userMap["TESTER"];
  const customer = userMap["CUSTOMER"];
  const admin = userMap["ADMIN"];
  const developer = userMap["DEVELOPER"];

  // ── 2. Bugs (all reported by Customer / Joe) ───────────────────────────────
  const bugDefs = [
    {
      title: "Login page shows generic error for invalid credentials",
      description:
        "When a user enters the wrong password the error message is too generic. " +
        "It just says 'Invalid credentials' with no guidance on what failed or how to fix it.",
      stepsToReproduce:
        "1. Go to /login\n" +
        "2. Enter a valid email with an incorrect password\n" +
        "3. Click Sign In\n" +
        "4. Observe: error reads 'Invalid credentials' — no specific guidance",
      priority: "HIGH",
      status: "OPEN",
      severity: "MAJOR",
      reporter: customer._id,
      tags: ["auth", "ux", "error-handling"],
    },
    {
      title: "Dashboard statistics do not refresh after creating a bug",
      description:
        "The bug count and status charts on the dashboard remain stale after a new bug is created. " +
        "A full page reload is required to see updated numbers.",
      stepsToReproduce:
        "1. Open Dashboard\n" +
        "2. Note the open-bug count\n" +
        "3. Navigate to /bugs/new and report a bug\n" +
        "4. Return to Dashboard — count unchanged without a hard refresh",
      priority: "MEDIUM",
      status: "OPEN",
      severity: "MAJOR",
      reporter: customer._id,
      tags: ["dashboard", "realtime", "stats"],
    },
    {
      title: "Attachment upload fails silently for files larger than 2 MB",
      description:
        "Uploading a PNG screenshot larger than 2 MB fails with no visible error. " +
        "The UI appears to accept the file but it never appears in the attachment list.",
      stepsToReproduce:
        "1. Open any bug detail page\n" +
        "2. Click Attach File\n" +
        "3. Select a PNG larger than 2 MB\n" +
        "4. The upload spinner appears briefly then disappears — no file, no error message",
      priority: "HIGH",
      status: "ASSIGNED",
      severity: "CRITICAL",
      reporter: customer._id,
      assignee: tester._id,
      tags: ["attachments", "upload", "validation"],
    },
    {
      title: "Profile and Settings menu items are not clickable",
      description:
        "In the logged-in dashboard, clicking Profile or Settings in the user dropdown does nothing. " +
        "The dropdown opens correctly and Sign Out works, but Profile and Settings have no navigation.",
      stepsToReproduce:
        "1. Log in with any account\n" +
        "2. Click the avatar / name in the top-right navbar\n" +
        "3. Click Profile or Settings\n" +
        "4. Nothing happens — URL does not change, no page loads",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      severity: "BLOCKER",
      reporter: customer._id,
      assignee: developer._id,
      tags: ["navigation", "dropdown", "routing", "ux"],
    },
    {
      title: "Customer cannot see status updates after reporting an issue",
      description:
        "After a customer reports a bug, there is no way for them to know when the status changes. " +
        "The bug detail page shows the current status but provides no history or notification.",
      stepsToReproduce:
        "1. Log in as customer\n" +
        "2. Report a bug\n" +
        "3. Admin changes status to IN_PROGRESS\n" +
        "4. Customer sees no change, no notification, no activity log",
      priority: "MEDIUM",
      status: "OPEN",
      severity: "MINOR",
      reporter: customer._id,
      tags: ["customer", "notifications", "status", "transparency"],
    },
  ];

  const bugs = [];
  let bugsCreated = 0;

  for (const def of bugDefs) {
    const { doc, created } = await findOrCreate(
      Bug,
      { title: def.title, reporter: def.reporter },
      def
    );
    bugs.push(doc);
    if (created) bugsCreated++;
  }

  logLine("Bugs", bugsCreated, bugDefs.length);

  const [bug1, bug2, bug3, bug4, bug5] = bugs;

  // ── 3. Comments (bug-scoped only per schema) ──────────────────────────────
  const commentDefs = [
    // Bug 1 — generic login error
    {
      content:
        "Reproduced on Chrome 124 and Firefox 125. The error message reads 'Invalid credentials' " +
        "with no indication whether the email was wrong or the password. " +
        "Customer is left guessing. Backend should return a more specific (but safe) message.",
      bug: bug1._id,
      author: tester._id,
    },
    {
      content:
        "I can confirm this happens every time I mistype my password. " +
        "Can it at least say whether my email was not found?",
      bug: bug1._id,
      author: customer._id,
    },
    // Bug 2 — dashboard stats stale
    {
      content:
        "Confirmed stale stats after creating bug #4 through the UI. " +
        "Dashboard showed the old count for over 2 minutes. " +
        "Hard refresh fixes it. Likely needs a WebSocket emit or polling on the dashboard stats endpoint.",
      bug: bug2._id,
      author: tester._id,
    },
    // Bug 3 — upload fails silently
    {
      content:
        "Confirmed. Upload fails silently for files over 2 MB. " +
        "Backend returns 413 Payload Too Large but the frontend catches the error and does nothing. " +
        "We need client-side file size validation before the request is sent, " +
        "and a visible error message if the server rejects it.",
      bug: bug3._id,
      author: tester._id,
    },
    // Bug 4 — profile/settings not clickable
    {
      content:
        "Tested on Chrome, Safari, and Edge. The dropdown opens fine and Sign Out works correctly. " +
        "Profile and Settings buttons have no onClick handlers in Navbar.jsx " +
        "and the routes /profile and /settings do not exist in the router.",
      bug: bug4._id,
      author: tester._id,
    },
    {
      content:
        "Prioritize this immediately. It blocks account management for every user regardless of role. " +
        "Customers, testers, admins, and developers are all affected.",
      bug: bug4._id,
      author: admin._id,
    },
    {
      content:
        "Fix applied in this session. Added useNavigate to Navbar.jsx dropdown, " +
        "created ProfilePage.jsx and SettingsPage.jsx, " +
        "registered /profile and /settings routes in App.js wrapped in the existing ProtectedRoute. " +
        "Also fixed getRoleBadgeColor to use uppercase role names (ADMIN/DEVELOPER/TESTER/CUSTOMER). " +
        "Both buttons now close the dropdown and navigate correctly.",
      bug: bug4._id,
      author: developer._id,
    },
  ];

  let commentsCreated = 0;

  for (const def of commentDefs) {
    const { created } = await findOrCreate(
      Comment,
      { content: def.content, bug: def.bug, author: def.author },
      def
    );
    if (created) commentsCreated++;
  }

  logLine("Comments", commentsCreated, commentDefs.length);

  // ── 4. User Stories ───────────────────────────────────────────────────────
  // Note: Story model has no createdBy field — stories are unattributed.
  const storyDefs = [
    {
      title:
        "As a customer, I want clear validation errors during registration so I know how to fix my input",
      description:
        "When registration fails, the error should explain exactly which rule was violated " +
        "(password too short, missing uppercase letter, email already registered) " +
        "rather than a generic failure message.",
      status: "DONE",
      priority: "HIGH",
      storyPoints: 3,
    },
    {
      title:
        "As a tester, I want to assign triaged bugs to developers so issues move through the workflow",
      description:
        "After reproducing and documenting a bug, the tester needs to assign it to a developer " +
        "without requiring admin intervention for every assignment.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      storyPoints: 5,
    },
    {
      title:
        "As an admin, I want dashboard metrics to reflect real-time bug status",
      description:
        "The dashboard should update bug counts and charts automatically when bugs are created, " +
        "assigned, or resolved — without requiring a manual page refresh.",
      status: "TODO",
      priority: "MEDIUM",
      storyPoints: 8,
    },
    {
      title:
        "As a customer, I want to upload screenshots when reporting a bug",
      description:
        "Customers should be able to attach image files directly on the bug report form. " +
        "The upload should validate file size and type client-side before sending to the server.",
      status: "TODO",
      priority: "MEDIUM",
      storyPoints: 5,
    },
    {
      title:
        "As a user, I want Profile and Settings navigation to work from the account menu",
      description:
        "Clicking Profile or Settings in the top-right user dropdown should navigate to " +
        "the respective pages. Both pages should be accessible to all authenticated roles.",
      status: "DONE",
      priority: "CRITICAL",
      storyPoints: 2,
    },
  ];

  const stories = [];
  let storiesCreated = 0;

  for (const def of storyDefs) {
    const { doc, created } = await findOrCreate(Story, { title: def.title }, def);
    stories.push(doc);
    if (created) storiesCreated++;
  }

  logLine("Stories", storiesCreated, storyDefs.length);

  const [story1, story2, story3, story4, story5] = stories;

  // ── 5. Tasks ──────────────────────────────────────────────────────────────
  // Note: Task model has no createdBy field; status is a free string (no enum).
  const taskDefs = [
    {
      title: "Fix Profile and Settings dropdown routing in Navbar",
      status: "DONE",
      assignee: developer._id,
      bug: bug4._id,
      story: story5._id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // completed 2 days ago
    },
    {
      title: "Align frontend and backend registration password validation",
      status: "DONE",
      assignee: tester._id,
      story: story1._id,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // completed 5 days ago
    },
    {
      title: "Add client-side file size validation before attachment upload",
      status: "IN_PROGRESS",
      assignee: developer._id,
      bug: bug3._id,
      story: story4._id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // due in 3 days
    },
    {
      title: "Add WebSocket event to refresh dashboard stats on bug creation",
      status: "TODO",
      assignee: developer._id,
      bug: bug2._id,
      story: story3._id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // due in 7 days
    },
    {
      title: "Improve customer-facing bug status label descriptions",
      status: "TODO",
      assignee: tester._id,
      story: story2._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // due in 5 days
    },
    {
      title: "Add activity log entry when a bug is assigned to a developer",
      status: "TODO",
      assignee: developer._id,
      story: story2._id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // due in 10 days
    },
  ];

  let tasksCreated = 0;

  for (const def of taskDefs) {
    const { created } = await findOrCreate(Task, { title: def.title }, def);
    if (created) tasksCreated++;
  }

  logLine("Tasks", tasksCreated, taskDefs.length);

  // ── 6. Attachments (bug-scoped only per schema) ───────────────────────────
  const attachmentDefs = [
    {
      filename: "profile-menu-not-clickable.png",
      originalName: "profile-menu-not-clickable.png",
      mimeType: "image/png",
      size: 142350,
      url: "/uploads/demo/profile-menu-not-clickable.png",
      bug: bug4._id,
      uploader: customer._id,
    },
    {
      filename: "register-validation-error.png",
      originalName: "register-validation-error.png",
      mimeType: "image/png",
      size: 98720,
      url: "/uploads/demo/register-validation-error.png",
      bug: bug1._id,
      uploader: customer._id,
    },
    {
      filename: "dashboard-stats-stale.png",
      originalName: "dashboard-stats-stale.png",
      mimeType: "image/png",
      size: 215430,
      url: "/uploads/demo/dashboard-stats-stale.png",
      bug: bug2._id,
      uploader: customer._id,
    },
  ];

  let attachmentsCreated = 0;

  for (const def of attachmentDefs) {
    const { created } = await findOrCreate(
      Attachment,
      { originalName: def.originalName, bug: def.bug },
      def
    );
    if (created) attachmentsCreated++;
  }

  logLine("Attachments", attachmentsCreated, attachmentDefs.length);

  // ── 7. Activities ─────────────────────────────────────────────────────────
  // action is a free string per schema — no enum constraint.
  const activityDefs = [
    {
      action: "BUG_CREATED",
      details: `Bug created: "${bug1.title}"`,
      user: customer._id,
      bug: bug1._id,
    },
    {
      action: "BUG_CREATED",
      details: `Bug created: "${bug2.title}"`,
      user: customer._id,
      bug: bug2._id,
    },
    {
      action: "BUG_CREATED",
      details: `Bug created: "${bug3.title}"`,
      user: customer._id,
      bug: bug3._id,
    },
    {
      action: "BUG_CREATED",
      details: `Bug created: "${bug4.title}"`,
      user: customer._id,
      bug: bug4._id,
    },
    {
      action: "BUG_CREATED",
      details: `Bug created: "${bug5.title}"`,
      user: customer._id,
      bug: bug5._id,
    },
    {
      action: "BUG_ASSIGNED",
      details: `Bug assigned to tester: "${bug3.title}"`,
      user: tester._id,
      bug: bug3._id,
    },
    {
      action: "BUG_ASSIGNED",
      details: `Bug assigned to developer: "${bug4.title}"`,
      user: tester._id,
      bug: bug4._id,
    },
    {
      action: "BUG_STATUS_CHANGED",
      details: `Status changed to IN_PROGRESS: "${bug4.title}"`,
      user: developer._id,
      bug: bug4._id,
    },
    {
      action: "COMMENT_ADDED",
      details: `Tester added reproduction notes on: "${bug4.title}"`,
      user: tester._id,
      bug: bug4._id,
    },
    {
      action: "ATTACHMENT_UPLOADED",
      details: `Screenshot attached by customer on: "${bug4.title}"`,
      user: customer._id,
      bug: bug4._id,
    },
  ];

  let activitiesCreated = 0;

  for (const def of activityDefs) {
    // Idempotency key: same action + user + bug + details = same record
    const { created } = await findOrCreate(
      Activity,
      {
        action: def.action,
        user: def.user,
        bug: def.bug ?? null,
        details: def.details,
      },
      def
    );
    if (created) activitiesCreated++;
  }

  logLine("Activities", activitiesCreated, activityDefs.length);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n✅  Seed complete!\n");
  console.log("Test credentials:");
  console.log("  TESTER   : mohamedhammad3.142@gmail.com / 12345678");
  console.log("  CUSTOMER : joenasr@gmail.com            / Joe12345678");
  console.log("  ADMIN    : admin@test.com               / 12345678");
  console.log("  DEVELOPER: devlead@test.com             / DevLead12345678");
  console.log();

  await mongoose.connection.close();
  console.log("DB connection closed.\n");
};

seed().catch((err) => {
  console.error("\n❌  Seed failed:", err.message);
  mongoose.connection.close().finally(() => process.exit(1));
});
