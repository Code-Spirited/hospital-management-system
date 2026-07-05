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
import { initialUsers } from "../pages/users/userData";

const UsersContext = createContext(null);

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState(initialUsers);

  const addUser = useCallback((user) => {
    setUsers((prev) => [user, ...prev]);
  }, []);

  const updateUser = useCallback((updated) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }, []);

  const deleteUser = useCallback((id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser, deleteUser }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used inside UsersProvider");
  return ctx;
};
