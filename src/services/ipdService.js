import { mockDelay, shouldSimulateError } from "./mockDelay";
import { initialAdmissions } from "../pages/ipd/ipdData";

export const ipdService = {
  getAll: async () => {
    await mockDelay();
    if (shouldSimulateError("ipd")) {
      throw new Error("Failed to load admissions. Please try again.");
    }
    return initialAdmissions;
    // Real implementation, once a backend exists:
    //   import apiClient from "./apiClient";
    //   const { data } = await apiClient.get("/ipd/admissions");
    //   return data;
  },
};
