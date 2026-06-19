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
import { Info } from "lucide-react";
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
