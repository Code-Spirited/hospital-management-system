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

  return (
    <UsersContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        deleteUser,
        permissions,
        updatePermissions,
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
