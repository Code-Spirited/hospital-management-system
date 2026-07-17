import { mockDelay, shouldSimulateError } from "./mockDelay";
import { initialAppointments } from "../pages/opd/appointmentsData";

export const appointmentsService = {
  getAll: async () => {
    await mockDelay();
    if (shouldSimulateError("appointments")) {
      throw new Error("Failed to load appointments. Please try again.");
    }
    return initialAppointments;
    // Real implementation, once a backend exists:
    //   import apiClient from "./apiClient";
    //   const { data } = await apiClient.get("/appointments");
    //   return data;
  },
};
