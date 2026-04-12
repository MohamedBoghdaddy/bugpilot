import express from "express";
import { param, body, validationResult } from "express-validator";
import authenticate from "../middleware/auth.js";
import authorize from "../middleware/rbac.js";

const router = express.Router();

// Default permissions map (stored in memory; extend to DB if needed)
const defaultPermissions = {
  CUSTOMER: {
    bugs: ['create', 'read', 'read_own'],
    comments: ['create', 'read'],
    users: ['read_own', 'update_own'],
    reports: [],
    admin: [],
  },
  TESTER: {
    bugs: ['create', 'read', 'update_status', 'read_own'],
    comments: ['create', 'read'],
    users: ['read_own', 'update_own'],
    reports: ['read'],
    admin: [],
  },
  DEVELOPER: {
    bugs: ['create', 'read', 'update', 'update_status', 'assign', 'read_own'],
    comments: ['create', 'read'],
    users: ['read', 'read_own', 'update_own'],
    reports: ['read'],
    admin: [],
  },
  ADMIN: {
    bugs: ['create', 'read', 'update', 'delete', 'update_status', 'assign', 'read_own'],
    comments: ['create', 'read', 'delete'],
    users: ['create', 'read', 'update', 'delete', 'read_own', 'update_own'],
    reports: ['read'],
    admin: ['read', 'manage_roles', 'view_logs'],
  },
};

// In-memory permissions store (clone defaults)
let permissions = JSON.parse(JSON.stringify(defaultPermissions));

router.use(authenticate);

// GET /api/permissions/roles - get all roles with permissions
router.get('/roles', async (req, res) => {
  res.json({ permissions });
});

// PATCH /api/permissions/roles/:role - update permissions for a role (admin only)
router.patch(
  '/roles/:role',
  authorize('ADMIN'),
  [
    param('role').isIn(['CUSTOMER', 'TESTER', 'DEVELOPER', 'ADMIN']).withMessage('Valid role is required'),
    body('permissions').isObject().withMessage('Permissions object is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.params;
    const newPermissions = req.body.permissions;

    // Validate structure: each key should map to an array of strings
    for (const [resource, actions] of Object.entries(newPermissions)) {
      if (!Array.isArray(actions) || !actions.every((a) => typeof a === 'string')) {
        return res.status(400).json({
          error: `Invalid permissions format for resource "${resource}". Expected array of strings.`,
        });
      }
    }

    permissions[role] = { ...permissions[role], ...newPermissions };

    res.json({
      message: `Permissions updated for role ${role}`,
      permissions: permissions[role],
    });
  }
);

export default router;
