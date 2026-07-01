// ─────────────────────────────────────────────────────────────────────────────
// Abbr.jsx
//
// Wraps an abbreviation so hovering — or focusing via keyboard, which
// Radix Tooltip supports automatically — shows the full term and a
// one-line description. Looked up from the central glossary by exact
// string match: either the wrapped children (if it's a plain string) or
// an explicit `term` prop for cases where the displayed text is too
// short/ambiguous to safely use as a lookup key on its own (drug
// schedule codes "H", "H1", "X" are a real example — see Pharmacy's
// SchedulePill).
//
// Deliberately graceful: if the term isn't in the glossary, this renders
// children completely unchanged — no wrapper, no styling, no tooltip.
// That makes it SAFE to wrap broadly (e.g. an entire badge component's
// text, regardless of which specific value it happens to hold) without
// auditing every call site — the glossary alone decides what's an
// abbreviation, never the call site.
//
// Requires <Tooltip.Provider> mounted once near the app root (done in
// App.jsx) — Radix Tooltip's context requirement.
// ─────────────────────────────────────────────────────────────────────────────

import * as Tooltip from "@radix-ui/react-tooltip";
import { GLOSSARY } from "../../../utils/glossary";

const Abbr = ({ children, term, underline = true }) => {
  const key = term ?? (typeof children === "string" ? children : null);
  const entry = key ? GLOSSARY[key] : null;

  if (!entry) return children;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <span
          tabIndex={0}
          style={{
            borderBottom: underline ? "1.5px dotted #94a3b8" : "none",
            cursor: "help",
            outline: "none",
          }}
        >
          {children}
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={6}
          collisionPadding={12}
          style={{
            background: "var(--hms-navy)",
            color: "#fff",
            borderRadius: 10,
            padding: "0.55rem 0.8rem",
            maxWidth: 250,
            fontFamily: "var(--font-body)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 200,
          }}
        >
          <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 800 }}>
            {entry.full}
          </p>
          {entry.description && (
            <p
              style={{
                margin: "3px 0 0",
                fontSize: "0.74rem",
                fontWeight: 500,
                opacity: 0.85,
                lineHeight: 1.4,
              }}
            >
              {entry.description}
            </p>
          )}
          <Tooltip.Arrow style={{ fill: "var(--hms-navy)" }} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export default Abbr;
