import { mockDelay } from "./mockDelay";
import { initialUsers, DEFAULT_PERMISSIONS } from "../pages/users/userData";

export const usersService = {
  getAll: async () => {
    await mockDelay();
    return initialUsers;
    // import apiClient from "./apiClient";
    // const { data } = await apiClient.get("/users");
    // return data;
  },
  getPermissions: async () => {
    await mockDelay();
    return DEFAULT_PERMISSIONS;
    // const { data } = await apiClient.get("/users/permissions");
    // return data;
  },
};
