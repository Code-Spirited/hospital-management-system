// ─────────────────────────────────────────────────────────────────────────────
// pharmacyService.js
//
// stockMovements and sales have no seed data (both start empty in
// PharmacyContext) — still routed through the service layer for
// structural consistency, resolving an empty array until a backend
// exists to actually persist and return this session's activity.
// ─────────────────────────────────────────────────────────────────────────────

import { mockDelay } from "./mockDelay";
import {
  initialMedicines,
  initialBatches,
} from "../pages/pharmacy/pharmacyData";

export const pharmacyService = {
  getMedicines: async () => {
    await mockDelay();
    return initialMedicines;
    // import apiClient from "./apiClient";
    // const { data } = await apiClient.get("/pharmacy/medicines");
    // return data;
  },
  getBatches: async () => {
    await mockDelay();
    return initialBatches;
    // const { data } = await apiClient.get("/pharmacy/batches");
    // return data;
  },
  getStockMovements: async () => {
    await mockDelay();
    return [];
    // const { data } = await apiClient.get("/pharmacy/stock-movements");
    // return data;
  },
  getSales: async () => {
    await mockDelay();
    return [];
    // const { data } = await apiClient.get("/pharmacy/sales");
    // return data;
  },
};
