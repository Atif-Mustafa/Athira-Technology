"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import {
  budgetRangeOptions,
  contactInterestOptions,
  projectStageOptions,
} from "../../content/contact";
import {
  contactSchema,
  flattenContactErrors,
  type ContactApiResponse,
  type ContactFieldErrors,
  type ContactFieldName,
} from "../../lib/contact/schema";
import { Button } from "../ui/Button";

type ContactFormValues = {
  fullName: string;
  workEmail: string;
  companyName: string;
  interest: string;
  projectStage: string;
  budgetRange: string;
  message: string;
  consent: boolean;
  website: string;
};

type FormStatus =
  | { kind: "idle" }
  | { kind: "submitting"; message: string }
  | { kind: "validation"; message: string }
  | { kind: "error"; message: string; requestId?: string }
  | { kind: "success"; message: string; requestId: string };

const initialValues: ContactFormValues = {
  fullName: "",
  workEmail: "",
  companyName: "",
  interest: "",
  projectStage: "",
  budgetRange: "",
  message: "",
  consent: false,
  website: "",
};

const inputClassName =
  "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none aria-invalid:border-red-400";

const fieldLabels: Partial<Record<ContactFieldName, string>> = {
  fullName: "Full name",
  workEmail: "Work email",
  companyName: "Company name",
  interest: "Area of interest",
  projectStage: "Project stage",
  budgetRange: "Indicative budget range",
  message: "Message",
  consent: "Privacy acknowledgment",
};

function firstError(errors: ContactFieldErrors, field: ContactFieldName) {
  return errors[field]?.[0];
}

function FieldError({ field, errors }: { field: ContactFieldName; errors: ContactFieldErrors }) {
  const error = firstError(errors, field);
  return error ? (
    <p id={`${field}-error`} className="mt-2 text-sm text-red-300">
      {error}
    </p>
  ) : null;
}

function isContactApiResponse(value: unknown): value is ContactApiResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    typeof value.ok === "boolean" &&
    "requestId" in value &&
    typeof value.requestId === "string" &&
    "message" in value &&
    typeof value.message === "string"
  );
}

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(initialValues);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const requestInFlight = useRef(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status.kind === "validation" || status.kind === "error") {
      errorSummaryRef.current?.focus();
    }
    if (status.kind === "success") {
      statusRef.current?.focus();
    }
  }, [status]);

  const updateTextValue = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.currentTarget;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current) return;

    const validation = contactSchema.safeParse(values);
    if (!validation.success) {
      setErrors(flattenContactErrors(validation.error));
      setStatus({
        kind: "validation",
        message: "Check the highlighted fields before submitting.",
      });
      return;
    }

    requestInFlight.current = true;
    setErrors({});
    setStatus({ kind: "submitting", message: "Sending your enquiry securely…" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!isContactApiResponse(payload)) {
        setStatus({
          kind: "error",
          message: "An unexpected response prevented delivery. Please try again later.",
        });
        return;
      }

      if (response.ok && payload.ok) {
        setValues(initialValues);
        setStatus({
          kind: "success",
          message: payload.message,
          requestId: payload.requestId,
        });
        return;
      }

      if (!payload.ok && payload.code === "validation_error") {
        setErrors(payload.fieldErrors ?? {});
        setStatus({ kind: "validation", message: payload.message });
        return;
      }

      const safeMessage = !payload.ok
        ? payload.message
        : "The enquiry could not be delivered. Please try again later.";
      setStatus({
        kind: "error",
        message: safeMessage,
        requestId: payload.requestId,
      });
    } catch {
      setStatus({
        kind: "error",
        message: "The contact service could not be reached. Your entries have been preserved.",
      });
    } finally {
      requestInFlight.current = false;
    }
  }

  const describedBy = (field: ContactFieldName, descriptionId?: string) =>
    [descriptionId, firstError(errors, field) ? `${field}-error` : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <>
      <div className="mb-8 flex gap-3 rounded-2xl border border-blue-400/20 bg-blue-400/5 p-5 text-sm leading-6 text-slate-200">
        <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
        <p>
          Submission sends this enquiry to Athira Technology through its configured email provider. Do not include passwords, source code, financial details, identity documents, health information, or other sensitive data.
        </p>
      </div>

      {(status.kind === "validation" || status.kind === "error") && (
        <div
          ref={errorSummaryRef}
          role="alert"
          tabIndex={-1}
          className="mb-8 rounded-2xl border border-red-400/30 bg-red-400/10 p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          <div className="flex gap-3">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
            <div>
              <h3 className="font-semibold text-white">The enquiry was not sent</h3>
              <p className="mt-2 text-sm leading-6 text-red-100">{status.message}</p>
              {Object.keys(errors).length > 0 ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-red-100">
                  {Object.entries(errors).map(([field, messages]) => (
                    <li key={field}>
                      <a href={`#${field}`} className="underline hover:no-underline">
                        {fieldLabels[field as ContactFieldName] ?? "Form field"}: {messages?.[0]}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {status.kind === "error" && status.requestId ? (
                <p className="mt-3 text-xs text-red-100">Reference: {status.requestId}</p>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {status.kind === "success" && (
        <div
          ref={statusRef}
          role="status"
          tabIndex={-1}
          className="mb-8 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          <div className="flex gap-3">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div>
              <h3 className="font-semibold text-white">Enquiry delivered</h3>
              <p className="mt-2 text-sm text-emerald-100">{status.message}</p>
              <p className="mt-2 text-xs text-emerald-100">Reference: {status.requestId}</p>
            </div>
          </div>
        </div>
      )}

      <form className="grid gap-6 sm:grid-cols-2" noValidate onSubmit={handleSubmit}>
        <div className="sm:col-span-2">
          <label htmlFor="interest" className="font-medium text-slate-200">
            Product or service interest <span aria-hidden="true" className="text-red-300">*</span>
          </label>
          <select
            id="interest"
            name="interest"
            required
            value={values.interest}
            onChange={updateTextValue}
            aria-invalid={Boolean(firstError(errors, "interest"))}
            aria-describedby={describedBy("interest")}
            className={inputClassName}
          >
            <option value="">Select an area</option>
            {contactInterestOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <FieldError field="interest" errors={errors} />
        </div>

        <div>
          <label htmlFor="fullName" className="font-medium text-slate-200">
            Full name <span aria-hidden="true" className="text-red-300">*</span>
          </label>
          <input id="fullName" name="fullName" type="text" required maxLength={100} autoComplete="name" value={values.fullName} onChange={updateTextValue} aria-invalid={Boolean(firstError(errors, "fullName"))} aria-describedby={describedBy("fullName")} className={inputClassName} />
          <FieldError field="fullName" errors={errors} />
        </div>

        <div>
          <label htmlFor="workEmail" className="font-medium text-slate-200">
            Work email <span aria-hidden="true" className="text-red-300">*</span>
          </label>
          <input id="workEmail" name="workEmail" type="email" required maxLength={254} autoComplete="email" value={values.workEmail} onChange={updateTextValue} aria-invalid={Boolean(firstError(errors, "workEmail"))} aria-describedby={describedBy("workEmail", "workEmail-description")} className={inputClassName} />
          <p id="workEmail-description" className="mt-2 text-xs leading-5 text-slate-400">Used only to reply to this business enquiry.</p>
          <FieldError field="workEmail" errors={errors} />
        </div>

        <div>
          <label htmlFor="companyName" className="font-medium text-slate-200">
            Company name <span aria-hidden="true" className="text-red-300">*</span>
          </label>
          <input id="companyName" name="companyName" type="text" required maxLength={120} autoComplete="organization" value={values.companyName} onChange={updateTextValue} aria-invalid={Boolean(firstError(errors, "companyName"))} aria-describedby={describedBy("companyName")} className={inputClassName} />
          <FieldError field="companyName" errors={errors} />
        </div>

        <div>
          <label htmlFor="projectStage" className="font-medium text-slate-200">Project stage <span className="text-slate-400">(optional)</span></label>
          <select id="projectStage" name="projectStage" value={values.projectStage} onChange={updateTextValue} aria-invalid={Boolean(firstError(errors, "projectStage"))} aria-describedby={describedBy("projectStage")} className={inputClassName}>
            <option value="">Select a stage</option>
            {projectStageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <FieldError field="projectStage" errors={errors} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="budgetRange" className="font-medium text-slate-200">Indicative project budget <span className="text-slate-400">(optional)</span></label>
          <select id="budgetRange" name="budgetRange" value={values.budgetRange} onChange={updateTextValue} aria-invalid={Boolean(firstError(errors, "budgetRange"))} aria-describedby={describedBy("budgetRange")} className={inputClassName}>
            <option value="">Select a range</option>
            {budgetRangeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <FieldError field="budgetRange" errors={errors} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="font-medium text-slate-200">
            What problem are you trying to solve? <span aria-hidden="true" className="text-red-300">*</span>
          </label>
          <textarea id="message" name="message" rows={6} required minLength={20} maxLength={3000} value={values.message} onChange={updateTextValue} aria-invalid={Boolean(firstError(errors, "message"))} aria-describedby={describedBy("message", "message-description")} className={inputClassName} />
          <p id="message-description" className="mt-2 text-xs leading-5 text-slate-400">Maximum 3,000 characters. Do not include confidential or sensitive information.</p>
          <FieldError field="message" errors={errors} />
        </div>

        <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={updateTextValue} />
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-start gap-3">
            <input
              id="consent"
              name="consent"
              type="checkbox"
              required
              checked={values.consent}
              onChange={(event) => {
                const consent = event.currentTarget.checked;
                setValues((current) => ({ ...current, consent }));
                setErrors((current) => ({ ...current, consent: undefined }));
              }}
              aria-invalid={Boolean(firstError(errors, "consent"))}
              aria-describedby={describedBy("consent", "consent-description")}
              className="mt-1 h-5 w-5 shrink-0 rounded border-slate-600 bg-slate-950 text-blue-600 focus:ring-blue-400"
            />
            <label htmlFor="consent" className="text-sm leading-6 text-slate-300">
              I have read the <Link href="/privacy" className="font-semibold text-blue-300 underline hover:no-underline">draft privacy notice</Link> and acknowledge that this enquiry will be delivered by email. <span aria-hidden="true" className="text-red-300">*</span>
            </label>
          </div>
          <p id="consent-description" className="mt-2 pl-8 text-xs leading-5 text-slate-400">This acknowledgment is not pre-selected and does not subscribe you to marketing.</p>
          <FieldError field="consent" errors={errors} />
        </div>

        <div className="sm:col-span-2">
          <Button type="submit" disabled={status.kind === "submitting"} aria-describedby="submit-description">
            {status.kind === "submitting" ? (
              <><LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />Sending enquiry…</>
            ) : "Send enquiry"}
          </Button>
          <p id="submit-description" className="mt-3 text-sm leading-6 text-slate-400">The server validates every submission and sends accepted enquiries to Athira Technology. No database copy is created by this application.</p>
          {status.kind === "submitting" ? <p role="status" aria-live="polite" className="sr-only">{status.message}</p> : null}
        </div>
      </form>
    </>
  );
}
