import { mockDelay, shouldSimulateError } from "./mockDelay";
import { initialUsers, DEFAULT_PERMISSIONS } from "../pages/users/userData";

export const usersService = {
  getAll: async () => {
    await mockDelay();
    if (shouldSimulateError("users")) {
      throw new Error("Failed to load users. Please try again.");
    }
    return initialUsers;
  },
  getPermissions: async () => {
    await mockDelay();
    if (shouldSimulateError("permissions")) {
      throw new Error("Failed to load permissions. Please try again.");
    }
    return DEFAULT_PERMISSIONS;
  },
};
