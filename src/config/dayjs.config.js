// ─────────────────────────────────────────────────────────────────────────────
// dayjs.config.js
//
// dayjs ships as a minimal 2KB core with optional plugins.
// Plugins must be extended once at app startup before any dayjs() call uses them.
// We import this file in main.jsx so plugins are registered before anything renders.
// ─────────────────────────────────────────────────────────────────────────────

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
