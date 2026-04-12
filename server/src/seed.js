import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.activity.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.bug.deleteMany();
  await prisma.story.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 12);

  // Create users (one per role)
  const admin = await prisma.user.create({
    data: {
      email: "admin@bugtrackr.com",
      password: hashedPassword,
      name: "Alice Admin",
      role: "ADMIN",
    },
  });

  const developer = await prisma.user.create({
    data: {
      email: "dev@bugtrackr.com",
      password: hashedPassword,
      name: "Dave Developer",
      role: "DEVELOPER",
    },
  });

  const tester = await prisma.user.create({
    data: {
      email: "tester@bugtrackr.com",
      password: hashedPassword,
      name: "Tina Tester",
      role: "TESTER",
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@bugtrackr.com",
      password: hashedPassword,
      name: "Charlie Customer",
      role: "CUSTOMER",
    },
  });

  console.log("Users created");

  // Create bugs
  const bug1 = await prisma.bug.create({
    data: {
      title: "Login page crashes on invalid email format",
      description:
        "When entering an email without @ symbol, the entire login page crashes with a white screen.",
      stepsToReproduce:
        '1. Go to /login\n2. Enter "notanemail" in email field\n3. Click Submit\n4. Page crashes',
      priority: "HIGH",
      severity: "CRITICAL",
      status: "ASSIGNED",
      reporterId: customer.id,
      assigneeId: developer.id,
    },
  });

  const bug2 = await prisma.bug.create({
    data: {
      title: "Dashboard charts not rendering on Safari",
      description:
        "The pie chart and bar chart on the dashboard do not render correctly on Safari 17.",
      stepsToReproduce:
        "1. Open Safari 17\n2. Navigate to dashboard\n3. Charts show blank areas",
      priority: "MEDIUM",
      severity: "MAJOR",
      status: "OPEN",
      reporterId: tester.id,
    },
  });

  const bug3 = await prisma.bug.create({
    data: {
      title: "File upload allows files larger than 10MB",
      description:
        "The file upload validation is not enforcing the 10MB limit on the server side.",
      priority: "HIGH",
      severity: "MAJOR",
      status: "IN_PROGRESS",
      reporterId: tester.id,
      assigneeId: developer.id,
    },
  });

  const bug4 = await prisma.bug.create({
    data: {
      title: "Typo in welcome email template",
      description: 'The welcome email says "Welcom" instead of "Welcome".',
      priority: "LOW",
      severity: "MINOR",
      status: "FIXED",
      reporterId: customer.id,
      assigneeId: developer.id,
    },
  });

  const bug5 = await prisma.bug.create({
    data: {
      title: "API rate limiting not working for unauthenticated requests",
      description:
        "Unauthenticated endpoints can be hit unlimited times without rate limiting.",
      priority: "CRITICAL",
      severity: "BLOCKER",
      status: "OPEN",
      reporterId: admin.id,
    },
  });

  console.log("Bugs created");

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        content:
          "I can reproduce this consistently on Chrome and Firefox as well.",
        bugId: bug1.id,
        authorId: tester.id,
      },
      {
        content:
          "Working on a fix. The email validation regex is missing on the client side.",
        bugId: bug1.id,
        authorId: developer.id,
      },
      {
        content:
          "This might be related to the charting library version. Have we tried updating it?",
        bugId: bug2.id,
        authorId: developer.id,
      },
      {
        content: "Fixed the typo and deployed to staging. Can someone verify?",
        bugId: bug4.id,
        authorId: developer.id,
      },
      {
        content: "Verified on staging. Looks good!",
        bugId: bug4.id,
        authorId: tester.id,
      },
      {
        content: "This is a security concern. Please prioritize.",
        bugId: bug5.id,
        authorId: admin.id,
      },
    ],
  });

  console.log("Comments created");

  // Create stories
  const story1 = await prisma.story.create({
    data: {
      title: "User Authentication Improvements",
      description:
        "Improve the authentication flow with better validation, 2FA support, and session management.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      storyPoints: 8,
    },
  });

  const story2 = await prisma.story.create({
    data: {
      title: "Dashboard Redesign",
      description:
        "Redesign the main dashboard with improved charts, filters, and real-time updates.",
      status: "TODO",
      priority: "MEDIUM",
      storyPoints: 13,
    },
  });

  console.log("Stories created");

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Implement client-side email validation",
        status: "IN_PROGRESS",
        assigneeId: developer.id,
        bugId: bug1.id,
        storyId: story1.id,
      },
      {
        title: "Add server-side file size validation",
        status: "TODO",
        assigneeId: developer.id,
        bugId: bug3.id,
      },
      {
        title: "Research Safari chart rendering issues",
        status: "TODO",
        assigneeId: developer.id,
        bugId: bug2.id,
        storyId: story2.id,
      },
      {
        title: "Implement rate limiting middleware",
        status: "TODO",
        assigneeId: developer.id,
        bugId: bug5.id,
      },
      {
        title: "Write E2E tests for login flow",
        status: "TODO",
        assigneeId: tester.id,
        storyId: story1.id,
      },
    ],
  });

  console.log("Tasks created");

  // Create activity logs
  await prisma.activity.createMany({
    data: [
      {
        action: "USER_REGISTERED",
        details: "Alice Admin registered",
        userId: admin.id,
      },
      {
        action: "USER_REGISTERED",
        details: "Dave Developer registered",
        userId: developer.id,
      },
      {
        action: "USER_REGISTERED",
        details: "Tina Tester registered",
        userId: tester.id,
      },
      {
        action: "USER_REGISTERED",
        details: "Charlie Customer registered",
        userId: customer.id,
      },
      {
        action: "BUG_CREATED",
        details: 'Bug "Login page crashes on invalid email format" created',
        bugId: bug1.id,
        userId: customer.id,
      },
      {
        action: "BUG_ASSIGNED",
        details: "Bug assigned to Dave Developer",
        bugId: bug1.id,
        userId: admin.id,
      },
      {
        action: "BUG_CREATED",
        details: 'Bug "Dashboard charts not rendering on Safari" created',
        bugId: bug2.id,
        userId: tester.id,
      },
      {
        action: "BUG_CREATED",
        details: 'Bug "File upload allows files larger than 10MB" created',
        bugId: bug3.id,
        userId: tester.id,
      },
      {
        action: "STATUS_CHANGED",
        details: "Status changed from OPEN to IN_PROGRESS",
        bugId: bug3.id,
        userId: developer.id,
      },
      {
        action: "BUG_CREATED",
        details: 'Bug "Typo in welcome email template" created',
        bugId: bug4.id,
        userId: customer.id,
      },
      {
        action: "STATUS_CHANGED",
        details: "Status changed from OPEN to FIXED",
        bugId: bug4.id,
        userId: developer.id,
      },
      {
        action: "BUG_CREATED",
        details: 'Bug "API rate limiting not working" created',
        bugId: bug5.id,
        userId: admin.id,
      },
      {
        action: "STORY_CREATED",
        details: 'Story "User Authentication Improvements" created',
        userId: admin.id,
      },
      {
        action: "STORY_CREATED",
        details: 'Story "Dashboard Redesign" created',
        userId: admin.id,
      },
    ],
  });

  console.log("Activity logs created");
  console.log("Seed completed successfully!");
  console.log("\nTest credentials (password: password123):");
  console.log("  Admin:     admin@bugtrackr.com");
  console.log("  Developer: dev@bugtrackr.com");
  console.log("  Tester:    tester@bugtrackr.com");
  console.log("  Customer:  customer@bugtrackr.com");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
