import { mockDelay } from "./mockDelay";
import { initialAdmissions } from "../pages/ipd/ipdData";

export const ipdService = {
  getAll: async () => {
    await mockDelay();
    return initialAdmissions;
    // Real implementation, once a backend exists:
    //   import apiClient from "./apiClient";
    //   const { data } = await apiClient.get("/ipd/admissions");
    //   return data;
  },
};
