// ─────────────────────────────────────────────────────────────────────────────
// CalendarDrawer.jsx
//
// Now reads live from AppointmentsContext instead of the old, separate
// calendarData.js mock — booking, rescheduling, or cancelling an
// appointment anywhere in the app shows up here immediately, on the
// correct date.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Drawer } from "vaul";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ArrowLeft,
  Clock,
  User2,
} from "lucide-react";
import { useAppointments } from "../../../context/AppointmentsContext";
import {
  VISIT_TYPE_CONFIG,
  STATUS_CONFIG,
} from "../../../pages/opd/appointmentsData";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const TypeBadge = ({ type }) => {
  const c = VISIT_TYPE_CONFIG[type] || { color: "#94a3b8", bg: "#f8fafc" };
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: "0.65rem",
        fontWeight: 700,
        background: c.bg,
        color: c.color,
      }}
    >
      {type}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: "#94a3b8", bg: "#f8fafc" };
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: "0.65rem",
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      {status}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const CalendarDrawer = ({ open, onOpenChange }) => {
  const { appointments } = useAppointments();
  const today = dayjs();
  const [view, setView] = useState("calendar");
  const [viewMonth, setViewMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [monthDir, setMonthDir] = useState(1);

  const prevMonth = () => {
    setMonthDir(-1);
    setViewMonth((m) => m.subtract(1, "month"));
  };
  const nextMonth = () => {
    setMonthDir(1);
    setViewMonth((m) => m.add(1, "month"));
  };
  const prevDay = () => setSelectedDate((d) => d.subtract(1, "day"));
  const nextDay = () => setSelectedDate((d) => d.add(1, "day"));

  // Build 42-cell grid
  const startOfMonth = viewMonth.startOf("month");
  const startDayOfWeek = startOfMonth.day();
  const cells = [];
  for (let i = 0; i < startDayOfWeek; i++)
    cells.push({
      date: startOfMonth.subtract(startDayOfWeek - i, "day"),
      inMonth: false,
    });
  for (let i = 1; i <= viewMonth.daysInMonth(); i++)
    cells.push({ date: viewMonth.date(i), inMonth: true });
  for (let i = 1; i <= 42 - cells.length; i++)
    cells.push({
      date: viewMonth.endOf("month").add(i, "day"),
      inMonth: false,
    });

  const selectedKey = selectedDate.format("YYYY-MM-DD");
  const dayAppointments = appointments
    .filter((a) => a.date === selectedKey)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(15,23,42,0.45)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        />

        <Drawer.Content
          style={{
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 101,
            width: "100%",
            maxWidth: 460,
            background: "#fff",
            boxShadow: "-8px 0 40px rgba(15,23,42,0.18)",
            display: "flex",
            flexDirection: "column",
            outline: "none",
            fontFamily: "var(--font-body)",
          }}
        >
          {/* ── Drawer header ── */}
          <div
            style={{
              padding: "1.25rem 1.375rem",
              borderBottom: "1px solid var(--hms-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--hms-blue-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarDays size={17} style={{ color: "var(--hms-blue)" }} />
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Appointment Calendar
                </h2>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#64748b",
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {view === "calendar"
                    ? "Tap a date to view appointments"
                    : selectedDate.format("dddd, D MMMM YYYY")}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onOpenChange(false);
                setView("calendar");
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                border: "1.5px solid var(--hms-border)",
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef2f2";
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "#fca5a5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.borderColor = "var(--hms-border)";
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* ── Content — switches between calendar and day view ── */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <AnimatePresence mode="wait">
              {view === "calendar" ? (
                // ── CALENDAR VIEW ──
                <motion.div
                  key="cal"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {/* Month navigation */}
                  <div
                    style={{
                      padding: "1rem 1.375rem 0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <button
                      onClick={prevMonth}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        border: "1.5px solid var(--hms-border)",
                        background: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#64748b",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--hms-blue)";
                        e.currentTarget.style.color = "var(--hms-blue)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--hms-border)";
                        e.currentTarget.style.color = "#64748b";
                      }}
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {viewMonth.format("MMMM YYYY")}
                    </span>

                    <button
                      onClick={nextMonth}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        border: "1.5px solid var(--hms-border)",
                        background: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#64748b",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--hms-blue)";
                        e.currentTarget.style.color = "var(--hms-blue)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--hms-border)";
                        e.currentTarget.style.color = "#64748b";
                      }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Weekday labels */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      padding: "0 1.125rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {WEEKDAYS.map((d) => (
                      <div
                        key={d}
                        style={{
                          textAlign: "center",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          padding: "0.2rem 0",
                        }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day cells — animated on month change */}
                  <AnimatePresence mode="wait" custom={monthDir}>
                    <motion.div
                      key={viewMonth.format("YYYY-MM")}
                      custom={monthDir}
                      initial={{ opacity: 0, x: monthDir * 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: monthDir * -24 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: 3,
                        padding: "0 1.125rem",
                      }}
                    >
                      {cells.map(({ date, inMonth }, i) => {
                        const key = date.format("YYYY-MM-DD");
                        const apts = appointments.filter((a) => a.date === key);
                        const hasApts = apts.length > 0;
                        const uniqueTypes = [
                          ...new Set(apts.map((a) => a.visitType)),
                        ].slice(0, 3);
                        const isToday = date.isSame(today, "day");
                        const isSelected = date.isSame(selectedDate, "day");
                        const hasEmergency = apts.some(
                          (a) => a.visitType === "Emergency",
                        );

                        return (
                          <motion.button
                            key={i}
                            whileHover={inMonth ? { scale: 1.1 } : {}}
                            whileTap={inMonth ? { scale: 0.92 } : {}}
                            onClick={() => {
                              if (!inMonth) return;
                              setSelectedDate(date);
                              setView("day");
                            }}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 3,
                              padding: "7px 2px",
                              borderRadius: 10,
                              border: "none",
                              cursor: inMonth ? "pointer" : "default",
                              minHeight: 48,
                              background: isSelected
                                ? "var(--hms-blue)"
                                : isToday
                                  ? "var(--hms-blue-light)"
                                  : hasEmergency && inMonth
                                    ? "#fff1f2"
                                    : "transparent",
                              outline:
                                isToday && !isSelected
                                  ? "1.5px solid var(--hms-blue)"
                                  : "none",
                              transition: "background 0.15s",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: isToday || isSelected ? 800 : 400,
                                color: isSelected
                                  ? "#fff"
                                  : isToday
                                    ? "var(--hms-blue)"
                                    : inMonth
                                      ? "#0f172a"
                                      : "#d1d5db",
                                lineHeight: 1,
                              }}
                            >
                              {date.date()}
                            </span>

                            {hasApts && inMonth && apts.length >= 4 && (
                              <span
                                style={{
                                  fontSize: "0.55rem",
                                  fontWeight: 800,
                                  color: isSelected
                                    ? "#fff"
                                    : "var(--hms-blue)",
                                }}
                              >
                                {apts.length}
                              </span>
                            )}

                            {hasApts && inMonth && apts.length < 4 && (
                              <div style={{ display: "flex", gap: 2 }}>
                                {uniqueTypes.map((type) => (
                                  <span
                                    key={type}
                                    style={{
                                      width: 5,
                                      height: 5,
                                      borderRadius: "50%",
                                      background: isSelected
                                        ? "rgba(255,255,255,0.8)"
                                        : VISIT_TYPE_CONFIG[type]?.color ||
                                          "#94a3b8",
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>

                  {/* Legend */}
                  <div
                    style={{
                      padding: "0.875rem 1.375rem",
                      borderTop: "1px solid var(--hms-border)",
                      marginTop: "auto",
                      display: "flex",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {Object.entries(VISIT_TYPE_CONFIG).map(([type, cfg]) => (
                      <div
                        key={type}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: cfg.color,
                            display: "inline-block",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "0.68rem",
                            color: "#64748b",
                            fontWeight: 600,
                          }}
                        >
                          {type}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                // ── DAY DETAIL VIEW ──
                <motion.div
                  key="day"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {/* Day navigation bar */}
                  <div
                    style={{
                      padding: "0.875rem 1.375rem",
                      borderBottom: "1px solid var(--hms-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <motion.button
                      whileHover={{ x: -3 }}
                      onClick={() => setView("calendar")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "5px 10px",
                        borderRadius: 8,
                        border: "1.5px solid var(--hms-border)",
                        background: "#fff",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "#64748b",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--hms-blue)";
                        e.currentTarget.style.color = "var(--hms-blue)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--hms-border)";
                        e.currentTarget.style.color = "#64748b";
                      }}
                    >
                      <ArrowLeft size={13} /> Calendar
                    </motion.button>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <button
                        onClick={prevDay}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          border: "1.5px solid var(--hms-border)",
                          background: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748b",
                        }}
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "0.9rem",
                            fontWeight: 800,
                            color: "#0f172a",
                            margin: 0,
                          }}
                        >
                          {selectedDate.isSame(today, "day")
                            ? "Today"
                            : selectedDate.format("D MMM")}
                        </p>
                        <p
                          style={{
                            fontSize: "0.67rem",
                            color: "#94a3b8",
                            margin: 0,
                            fontWeight: 500,
                          }}
                        >
                          {selectedDate.format("dddd")}
                        </p>
                      </div>
                      <button
                        onClick={nextDay}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          border: "1.5px solid var(--hms-border)",
                          background: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748b",
                        }}
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>

                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: "var(--hms-blue-light)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "var(--hms-blue)",
                      }}
                    >
                      {dayAppointments.length} appts
                    </span>
                  </div>

                  {/* Appointment list */}
                  <div
                    data-lenis-prevent
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "0.875rem 1.125rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {dayAppointments.length === 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "4rem 0",
                          gap: 12,
                        }}
                      >
                        <CalendarDays size={32} style={{ color: "#e2e8f0" }} />
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "#94a3b8",
                            fontWeight: 500,
                            margin: 0,
                          }}
                        >
                          No appointments on this day
                        </p>
                      </div>
                    ) : (
                      dayAppointments.map((apt, i) => (
                        <motion.div
                          key={apt.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.2 }}
                          style={{
                            padding: "0.875rem 1rem",
                            borderRadius: 12,
                            border: "1px solid var(--hms-border)",
                            background: "#fafbfd",
                            borderLeft: `4px solid ${VISIT_TYPE_CONFIG[apt.visitType]?.color || "#94a3b8"}`,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f0f4fb";
                            e.currentTarget.style.boxShadow =
                              "var(--shadow-sm)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fafbfd";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              marginBottom: "0.375rem",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <Clock size={12} style={{ color: "#94a3b8" }} />
                              <span
                                style={{
                                  fontFamily: "var(--font-display)",
                                  fontSize: "0.825rem",
                                  fontWeight: 800,
                                  color: "#0f172a",
                                }}
                              >
                                {apt.time}
                              </span>
                            </div>
                            <StatusBadge status={apt.status} />
                          </div>

                          <p
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: 700,
                              color: "#0f172a",
                              margin: "0 0 4px",
                            }}
                          >
                            {apt.patientName}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <User2 size={11} style={{ color: "#94a3b8" }} />
                            <span
                              style={{
                                fontSize: "0.72rem",
                                color: "#64748b",
                                fontWeight: 500,
                              }}
                            >
                              {apt.doctor}
                            </span>
                            <span style={{ color: "#e2e8f0" }}>•</span>
                            <TypeBadge type={apt.visitType} />
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default CalendarDrawer;
