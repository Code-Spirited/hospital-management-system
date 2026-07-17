import { mockDelay, shouldSimulateError } from "./mockDelay";
import {
  initialMedicines,
  initialBatches,
} from "../pages/pharmacy/pharmacyData";

export const pharmacyService = {
  getMedicines: async () => {
    await mockDelay();
    if (shouldSimulateError("medicines")) {
      throw new Error("Failed to load medicines. Please try again.");
    }
    return initialMedicines;
  },
  getBatches: async () => {
    await mockDelay();
    if (shouldSimulateError("batches")) {
      throw new Error("Failed to load batches. Please try again.");
    }
    return initialBatches;
  },
  getStockMovements: async () => {
    await mockDelay();
    if (shouldSimulateError("stockMovements")) {
      throw new Error("Failed to load stock movements. Please try again.");
    }
    return [];
  },
  getSales: async () => {
    await mockDelay();
    if (shouldSimulateError("sales")) {
      throw new Error("Failed to load sales. Please try again.");
    }
    return [];
  },
};
