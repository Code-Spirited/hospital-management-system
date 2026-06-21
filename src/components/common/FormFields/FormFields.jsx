// ─────────────────────────────────────────────────────────────────────────────
// FormFields.jsx
//
// Shared, styled form primitives used across every module's forms (OPD today;
// IPD, Pharmacy, and Users in upcoming weeks). Extracted from the Patient
// Registration form so this styling and the dropdown-clipping/scroll fixes
// built into FormSelect only need to exist in one place.
// ─────────────────────────────────────────────────────────────────────────────

import { Controller } from "react-hook-form";
import Select, { components as RSComponents } from "react-select";
import * as RadixSelect from "@radix-ui/react-select";
import { Info, Check, ChevronDown } from "lucide-react";
import { rsStyles } from "./selectStyles";

// Bypasses Lenis's global smooth-scroll so mouse-wheel scrolling inside a
// dropdown's option list scrolls the list itself, not the page behind it.
export const SelectMenuList = (props) => (
  <div data-lenis-prevent>
    <RSComponents.MenuList {...props} />
  </div>
);

// Renders via menuPortalTarget so the dropdown escapes any ancestor's
// overflow:hidden (e.g. a multi-step form's slide-transition wrapper).
export const FormSelect = ({ name, control, options, error, ...rest }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <Select
        options={options}
        value={
          field.value ? options.find((o) => o.value === field.value) : null
        }
        onChange={(o) => field.onChange(o?.value ?? "")}
        onBlur={field.onBlur}
        styles={rsStyles(!!error)}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        components={{ MenuList: SelectMenuList }}
        {...rest}
      />
    )}
  />
);

export const FormField = ({ label, required, error, hint, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label
      style={{
        fontSize: "0.78rem",
        fontWeight: 700,
        color: "#374151",
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {label}
      {required && <span style={{ color: "#ef4444", lineHeight: 1 }}>*</span>}
    </label>
    {children}
    {hint && !error && (
      <p
        style={{
          fontSize: "0.7rem",
          color: "#94a3b8",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Info size={11} /> {hint}
      </p>
    )}
    {error && (
      <p
        style={{
          fontSize: "0.72rem",
          color: "#dc2626",
          margin: 0,
          fontWeight: 600,
        }}
      >
        {error}
      </p>
    )}
  </div>
);

export const FormInput = ({ error, ...props }) => (
  <input
    {...props}
    style={{
      padding: "0.575rem 0.875rem",
      border: `1.5px solid ${error ? "#dc2626" : "var(--hms-border)"}`,
      borderRadius: 10,
      fontSize: "0.875rem",
      fontFamily: "var(--font-body)",
      color: "var(--hms-navy)",
      background: "#fff",
      outline: "none",
      width: "100%",
      maxWidth: "100%",
      transition: "border-color 0.2s, box-shadow 0.2s",
      boxSizing: "border-box",
    }}
    onFocus={(e) => {
      e.target.style.borderColor = error ? "#dc2626" : "var(--hms-blue)";
      e.target.style.boxShadow = error
        ? "0 0 0 3px rgba(220,38,38,0.1)"
        : "0 0 0 3px rgba(37,99,235,0.1)";
    }}
    onBlur={(e) => {
      e.target.style.borderColor = error ? "#dc2626" : "var(--hms-border)";
      e.target.style.boxShadow = "none";
    }}
  />
);

export const FormTextarea = ({ error, ...props }) => (
  <textarea
    {...props}
    rows={3}
    style={{
      padding: "0.575rem 0.875rem",
      border: `1.5px solid ${error ? "#dc2626" : "var(--hms-border)"}`,
      borderRadius: 10,
      fontSize: "0.875rem",
      fontFamily: "var(--font-body)",
      color: "var(--hms-navy)",
      background: "#fff",
      outline: "none",
      width: "100%",
      resize: "vertical",
      transition: "border-color 0.2s, box-shadow 0.2s",
      boxSizing: "border-box",
    }}
    onFocus={(e) => {
      e.target.style.borderColor = error ? "#dc2626" : "var(--hms-blue)";
      e.target.style.boxShadow = error
        ? "0 0 0 3px rgba(220,38,38,0.1)"
        : "0 0 0 3px rgba(37,99,235,0.1)";
    }}
    onBlur={(e) => {
      e.target.style.borderColor = error ? "#dc2626" : "var(--hms-border)";
      e.target.style.boxShadow = "none";
    }}
  />
);

// ── DrawerSelect — accessible select safe to use inside vaul Drawers ─────────
// Built on @radix-ui/react-select, deliberately rendered WITHOUT
// Select.Portal. A portaled element is, by definition, no longer a DOM
// descendant of whatever rendered it — and vaul's outside-click detection
// for dismissing a drawer can misread a tap inside a portaled menu as a tap
// outside the drawer. Skipping the portal means the menu is always a real
// child of wherever this is used — there's no boundary for vaul to
// misjudge, by construction.
//
// Width is pinned to Radix's own --radix-select-trigger-width and height to
// --radix-select-content-available-height — both computed live by Radix's
// underlying Floating UI engine — so the menu can never render wider than
// its field or taller than the space actually available on screen.
export const DrawerSelect = ({
  name,
  control,
  options,
  error,
  placeholder,
  disabled,
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <RadixSelect.Root
        value={field.value}
        onValueChange={field.onChange}
        disabled={disabled}
      >
        <style>{`
          .hms-dsel-item[data-highlighted] { background: var(--hms-surface) !important; outline: none; }
          .hms-dsel-item[data-state="checked"] { color: var(--hms-blue) !important; font-weight: 700 !important; }
        `}</style>

        <RadixSelect.Trigger
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "0.575rem 0.875rem",
            border: `1.5px solid ${error ? "#dc2626" : "var(--hms-border)"}`,
            borderRadius: 10,
            fontSize: "0.875rem",
            fontFamily: "var(--font-body)",
            color: field.value ? "var(--hms-navy)" : "#94a3b8",
            background: disabled ? "var(--hms-surface)" : "#fff",
            cursor: disabled ? "not-allowed" : "pointer",
            outline: "none",
            boxSizing: "border-box",
            textAlign: "left",
          }}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon
            style={{ flexShrink: 0, marginLeft: 8, display: "flex" }}
          >
            <ChevronDown size={15} style={{ color: "#94a3b8" }} />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          style={{
            width: "var(--radix-select-trigger-width)",
            maxHeight:
              "min(260px, var(--radix-select-content-available-height))",
            background: "#fff",
            borderRadius: 12,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
            zIndex: 50,
            fontFamily: "var(--font-body)",
          }}
        >
          <RadixSelect.Viewport style={{ padding: "0.375rem" }}>
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className="hms-dsel-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0.5rem 0.625rem 0.5rem 1.875rem",
                  position: "relative",
                  borderRadius: 8,
                  fontSize: "0.85rem",
                  color: "var(--hms-navy)",
                  cursor: "pointer",
                  outline: "none",
                  userSelect: "none",
                }}
              >
                <RadixSelect.ItemIndicator
                  style={{ position: "absolute", left: 8, display: "flex" }}
                >
                  <Check size={14} style={{ color: "var(--hms-blue)" }} />
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Root>
    )}
  />
);

// ── DateInput — plain text field, DD-MM-YYYY, no native calendar popup ───────
// Auto-inserts the dashes as digits are typed (typing "20062026" becomes
// "20-06-2026"). Used for every date field across the whole app — the
// browser's native date-picker size and position is outside our control
// and has rendered inconsistently across devices and zoom levels.
const formatDateAsTyped = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join("-");
};

export const DateInput = ({ error, onChange, ...props }) => (
  <input
    {...props}
    type="text"
    inputMode="numeric"
    placeholder="DD-MM-YYYY"
    maxLength={10}
    onChange={(e) => {
      e.target.value = formatDateAsTyped(e.target.value);
      onChange?.(e);
    }}
    style={{
      padding: "0.575rem 0.875rem",
      border: `1.5px solid ${error ? "#dc2626" : "var(--hms-border)"}`,
      borderRadius: 10,
      fontSize: "0.875rem",
      fontFamily: "var(--font-body)",
      color: "var(--hms-navy)",
      background: "#fff",
      outline: "none",
      width: "100%",
      maxWidth: "100%",
      boxSizing: "border-box",
      transition: "border-color 0.2s, box-shadow 0.2s",
    }}
    onFocus={(e) => {
      e.target.style.borderColor = error ? "#dc2626" : "var(--hms-blue)";
      e.target.style.boxShadow = error
        ? "0 0 0 3px rgba(220,38,38,0.1)"
        : "0 0 0 3px rgba(37,99,235,0.1)";
    }}
    onBlur={(e) => {
      e.target.style.borderColor = error ? "#dc2626" : "var(--hms-border)";
      e.target.style.boxShadow = "none";
    }}
  />
);
