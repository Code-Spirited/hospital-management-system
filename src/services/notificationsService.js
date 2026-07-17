// ─────────────────────────────────────────────────────────────────────────────
// notificationsService.js
//
// Only the INITIAL notification list is routed through here. The
// ongoing live-notification simulation (see NotificationsContext.jsx's
// own useEffect) is a genuinely different transport concept — a
// continuous feed, not a one-time list fetch — and is already correctly
// flagged in that file's own header comment as future WebSocket work,
// not REST. Forcing it through this same shape would misrepresent what
// it will actually become.
// ─────────────────────────────────────────────────────────────────────────────

import { mockDelay, shouldSimulateError } from "./mockDelay";
import { initialNotifications } from "../pages/dashboard/notificationsData";

export const notificationsService = {
  getInitial: async () => {
    await mockDelay();
    if (shouldSimulateError("notifications")) {
      throw new Error("Failed to load notifications. Please try again.");
    }
    return initialNotifications;
    // Once a backend exists, likely an initial REST fetch that then
    // hands off to a WebSocket for live updates:
    //   import apiClient from "./apiClient";
    //   const { data } = await apiClient.get("/notifications");
    //   return data;
  },
};
