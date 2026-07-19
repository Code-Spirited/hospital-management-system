// ─────────────────────────────────────────────────────────────────────────────
// AddUser.jsx — Week 6, Tuesday
//
// Creates a new system user. Status is never asked here — it's always
// "Active" for a brand-new account; Inactive/Suspended are states a user
// reaches later in their employment, never at creation, so offering that
// choice here would only invite an inconsistent starting state.
// lastLogin is set to null (handled explicitly wherever it's displayed —
// see UserDirectory.jsx's "Never logged in" fix). Gender and Joined-On
// are asked here and ONLY here — Edit User treats both as immutable
// once set, matching editPatientSchema's identical principle for DOB.
//
// Week 8, Thursday — responsive fix: all three field grids below (Personal
// Information, Role & Department, Employment) were fixed at
// repeat(2, 1fr) with no mobile fallback. They share one class,
// .adduser-grid-2, since all three use the identical column/gap pattern —
// same named-class + @media (max-width: 540px) approach used everywhere
// else in this pass.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";
import { UserPlus, CheckCircle2 } from "lucide-react";
import {
  FormField as Field,
  FormInput as Input,
  FormSelect,
  DateInput,
} from "../../components/common";
import { useUsers } from "../../context/UsersContext";
import { generateId } from "../../utils/generateId";
import { ROLE_CONFIG, DEPARTMENTS } from "./userData";
import { addUserSchema } from "./userSchema";

const opt = (v) => ({ value: v, label: v });
const ROLE_OPTIONS = Object.keys(ROLE_CONFIG).map(opt);
const DEPARTMENT_OPTIONS = DEPARTMENTS.map(opt);
const GENDER_OPTIONS = ["Male", "Female", "Other"].map(opt);

const AddUser = () => {
  const navigate = useNavigate();
  const { users, addUser } = useUsers();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // Custom resolver layered on top of Zod: once schema validation
    // passes, also checks the entered email against every existing
    // user's email. Two staff accounts silently sharing a login email
    // is a real, common data problem worth catching here, not just a
    // format check.
    resolver: async (values, context, options) => {
      const result = await zodResolver(addUserSchema)(values, context, options);
      if (Object.keys(result.errors).length === 0) {
        const emailTaken = users.some(
          (u) =>
            u.email.trim().toLowerCase() === values.email.trim().toLowerCase(),
        );
        if (emailTaken) {
          return {
            values: {},
            errors: {
              email: {
                type: "manual",
                message: "This email is already registered to another user",
              },
            },
          };
        }
      }
      return result;
    },
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      gender: "",
      role: "",
      department: "",
      joinedOn: dayjs().format("DD-MM-YYYY"),
    },
  });

  const submit = async (data) => {
    setSubmitting(true);
    const isoJoinedOn = dayjs(data.joinedOn, "DD-MM-YYYY").format("YYYY-MM-DD");
    await new Promise((r) => setTimeout(r, 500));
    const newId = generateId("U", 1100, 900);
    addUser({
      id: newId,
      ...data,
      joinedOn: isoJoinedOn,
      status: "Active",
      lastLogin: null,
    });
    setSubmitting(false);
    toast.success("User added", {
      description: `${data.fullName} · ${data.role}`,
    });
    navigate("/users");
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        maxWidth: 780,
        margin: "0 auto",
      }}
    >
      <style>{`
        .adduser-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        @media (max-width: 540px) { .adduser-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--hms-blue-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserPlus size={14} style={{ color: "var(--hms-blue)" }} />
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--hms-blue)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Users · New User
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--hms-navy)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Add User
        </h1>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-xs)",
            padding: "1.75rem",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 1.375rem",
            }}
          >
            Personal Information
          </h2>
          <div className="adduser-grid-2">
            <div style={{ gridColumn: "1 / -1" }}>
              <Field
                label="Full Name"
                required
                error={errors.fullName?.message}
              >
                <Input
                  {...register("fullName")}
                  placeholder="e.g. Dr. Kavya Reddy"
                  error={errors.fullName}
                />
              </Field>
            </div>
            <Field label="Email" required error={errors.email?.message}>
              <Input
                {...register("email")}
                type="email"
                placeholder="name@auctechhms.com"
                error={errors.email}
              />
            </Field>
            <Field label="Phone" required error={errors.phone?.message}>
              <Input
                {...register("phone")}
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                error={errors.phone}
              />
            </Field>
            <Field
              label="Gender"
              required
              error={errors.gender?.message}
              hint="Cannot be changed after the account is created"
            >
              <FormSelect
                name="gender"
                control={control}
                options={GENDER_OPTIONS}
                error={errors.gender}
                placeholder="Select gender"
                isSearchable={false}
              />
            </Field>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-xs)",
            padding: "1.75rem",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 1.375rem",
            }}
          >
            Role & Department
          </h2>
          <div className="adduser-grid-2">
            <Field label="Role" required error={errors.role?.message}>
              <FormSelect
                name="role"
                control={control}
                options={ROLE_OPTIONS}
                error={errors.role}
                placeholder="Select role"
                isSearchable={false}
              />
            </Field>
            <Field
              label="Department"
              required
              error={errors.department?.message}
            >
              <FormSelect
                name="department"
                control={control}
                options={DEPARTMENT_OPTIONS}
                error={errors.department}
                placeholder="Select department"
                isSearchable
              />
            </Field>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid var(--hms-border)",
            boxShadow: "var(--shadow-xs)",
            padding: "1.75rem",
            marginBottom: "1.25rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--hms-navy)",
              margin: "0 0 1.375rem",
            }}
          >
            Employment
          </h2>
          <div className="adduser-grid-2">
            <Field
              label="Joined On"
              required
              error={errors.joinedOn?.message}
              hint="Cannot be changed after the account is created"
            >
              <DateInput {...register("joinedOn")} error={errors.joinedOn} />
            </Field>
            <Field label="Initial Status" hint="Every new user starts Active">
              <Input
                value="Active"
                disabled
                readOnly
                style={{
                  padding: "0.575rem 0.875rem",
                  border: "1.5px solid var(--hms-border)",
                  borderRadius: 10,
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-body)",
                  color: "#64748b",
                  background: "var(--hms-surface)",
                  width: "100%",
                  boxSizing: "border-box",
                  cursor: "not-allowed",
                }}
              />
            </Field>
          </div>
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit(submit)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            justifyContent: "center",
            padding: "0.75rem 1rem",
            border: "none",
            borderRadius: 12,
            background: submitting ? "#94a3b8" : "var(--hms-success)",
            color: "#fff",
            cursor: submitting ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 700,
            boxShadow: submitting ? "none" : "0 4px 14px rgba(5,150,105,0.3)",
          }}
        >
          <CheckCircle2 size={17} /> {submitting ? "Adding..." : "Add User"}
        </button>
      </form>
    </div>
  );
};

export default AddUser;
