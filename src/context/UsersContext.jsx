/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// UsersContext.jsx
//
// Single source of truth for system users, mirroring the exact pattern
// used by every other module's context. updateUser and deleteUser are
// included now even though only "read" is exercised today — Tuesday's
// Add/Edit User Form will call into this same context without its shape
// needing to change, the same forward-looking approach used for
// IPDContext's dischargeAdmission stub back in Week 4.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from "react";
import { initialUsers, DEFAULT_PERMISSIONS } from "../pages/users/userData";

const UsersContext = createContext(null);

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState(initialUsers);
  // Role → module → access-level matrix, edited on the Roles &
  // Permissions page. Lives here rather than as local page state since
  // it's conceptually tied to Users/Roles, and is the natural place
  // future work (e.g. actually gating Sidebar links by a logged-in
  // user's role) would read from.
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);
  // Sparse per-user EXCEPTIONS layered on top of the role-level defaults
  // above — e.g. one specific Nurse granted View Only on Pharmacy,
  // without changing the Nurse role's default for everyone else. Only
  // users who actually have at least one override appear as keys here;
  // a user with no entry simply inherits their role's default everywhere.
  const [permissionOverrides, setPermissionOverrides] = useState({});

  const addUser = useCallback((user) => {
    setUsers((prev) => [user, ...prev]);
  }, []);

  const updateUser = useCallback((updated) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }, []);

  const deleteUser = useCallback((id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const updatePermissions = useCallback((newMatrix) => {
    setPermissions(newMatrix);
  }, []);

  // Replaces one user's ENTIRE override set at once (called on Save,
  // after edits are staged locally on the page) — same deliberate-commit
  // pattern as updatePermissions above. Passing an empty object removes
  // the user's entry entirely, keeping this map sparse — a user with
  // zero actual overrides should never linger as an empty {} key.
  const setUserOverrides = useCallback((userId, moduleOverrides) => {
    setPermissionOverrides((prev) => {
      const next = { ...prev };
      if (!moduleOverrides || Object.keys(moduleOverrides).length === 0) {
        delete next[userId];
      } else {
        next[userId] = moduleOverrides;
      }
      return next;
    });
  }, []);

  return (
    <UsersContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        deleteUser,
        permissions,
        updatePermissions,
        permissionOverrides,
        setUserOverrides,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used inside UsersProvider");
  return ctx;
};
