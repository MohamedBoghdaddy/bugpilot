const defaultPermissions = {
  CUSTOMER: {
    bugs: ["create", "read", "read_own"],
    comments: ["create", "read"],
    users: ["read_own", "update_own"],
    reports: [],
    admin: [],
  },
  TESTER: {
    bugs: ["create", "read", "update_status", "read_own"],
    comments: ["create", "read"],
    users: ["read_own", "update_own"],
    reports: ["read"],
    admin: [],
  },
  DEVELOPER: {
    bugs: ["create", "read", "update", "update_status", "assign", "read_own"],
    comments: ["create", "read"],
    users: ["read", "read_own", "update_own"],
    reports: ["read"],
    admin: [],
  },
  ADMIN: {
    bugs: ["create", "read", "update", "delete", "update_status", "assign", "read_own"],
    comments: ["create", "read", "delete"],
    users: ["create", "read", "update", "delete", "read_own", "update_own"],
    reports: ["read"],
    admin: ["read", "manage_roles", "view_logs"],
  },
};

let permissions = JSON.parse(JSON.stringify(defaultPermissions));

export const getRoles = (req, res) => {
  res.json({ permissions });
};

export const updateRolePermissions = (req, res) => {
  const { role } = req.params;
  const newPermissions = req.body.permissions;

  for (const [resource, actions] of Object.entries(newPermissions)) {
    if (!Array.isArray(actions) || !actions.every((a) => typeof a === "string")) {
      return res.status(400).json({
        error: `Invalid permissions format for resource "${resource}". Expected array of strings.`,
      });
    }
  }

  permissions[role] = { ...permissions[role], ...newPermissions };
  res.json({ message: `Permissions updated for role ${role}`, permissions: permissions[role] });
};
