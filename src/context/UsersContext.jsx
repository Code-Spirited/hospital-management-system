/* eslint-disable react-refresh/only-export-components */
// ─────────────────────────────────────────────────────────────────────────────
// UsersContext.jsx
//
// Week 8 update: users and permissions now route through usersService
// via useAsyncData. isLoading/error are new, additive combined fields.
// permissionOverrides and userSettingsMap stay plain useState — both are
// sparse, session-derived state with no natural seed list to fetch (they
// start empty {} by design), so routing them through the same "getAll"
// service shape wouldn't make sense. All mutation functions are unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from "react";
import { useAsyncData } from "../hooks/useAsyncData";
import { usersService } from "../services/usersService";
import {
  initialUsers,
  DEFAULT_PERMISSIONS,
  DEFAULT_USER_SETTINGS,
} from "../pages/users/userData";

const UsersContext = createContext(null);

export const UsersProvider = ({ children }) => {
  const {
    data: users,
    setData: setUsers,
    isLoading: usersLoading,
    error: usersError,
  } = useAsyncData(usersService.getAll, initialUsers);
  const {
    data: permissions,
    setData: setPermissions,
    isLoading: permissionsLoading,
  } = useAsyncData(usersService.getPermissions, DEFAULT_PERMISSIONS);

  const [permissionOverrides, setPermissionOverrides] = useState({});
  const [userSettingsMap, setUserSettingsMap] = useState({});

  const addUser = useCallback(
    (user) => {
      setUsers((prev) => [user, ...prev]);
    },
    [setUsers],
  );

  const updateUser = useCallback(
    (updated) => {
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    },
    [setUsers],
  );

  const deleteUser = useCallback(
    (id) => {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    },
    [setUsers],
  );

  const updatePermissions = useCallback(
    (newMatrix) => {
      setPermissions(newMatrix);
    },
    [setPermissions],
  );

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

  const getUserSettings = useCallback(
    (userId) => userSettingsMap[userId] ?? DEFAULT_USER_SETTINGS,
    [userSettingsMap],
  );

  const updateUserSettings = useCallback((userId, settings) => {
    setUserSettingsMap((prev) => ({ ...prev, [userId]: settings }));
  }, []);

  return (
    <UsersContext.Provider
      value={{
        users,
        isLoading: usersLoading || permissionsLoading,
        error: usersError || null,
        addUser,
        updateUser,
        deleteUser,
        permissions,
        updatePermissions,
        permissionOverrides,
        setUserOverrides,
        getUserSettings,
        updateUserSettings,
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
