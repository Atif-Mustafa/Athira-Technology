"use client";

import { useActionState } from "react";
import {
  addEnquiryNoteAction,
  assignEnquiryAction,
  editEnquiryNoteAction,
  setEnquiryPriorityAction,
  setEnquiryStatusAction,
  type EnquiryActionState,
} from "../../../app/admin/enquiries/actions";
import type { AssignableStaff, EnquiryNote, EnquiryPriority, EnquiryStatus } from "../../../server/enquiries/types";

const initialState: EnquiryActionState = { kind: "idle" };
const controlClass = "mt-2 min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:opacity-60";
const buttonClass = "mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60";

function Feedback({ state }: { state: EnquiryActionState }) {
  if (state.kind === "idle") return null;
  return (
    <p
      role={state.kind === "success" ? "status" : "alert"}
      aria-live="polite"
      className={`mt-3 rounded-lg border p-3 text-sm ${state.kind === "success" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100" : "border-red-400/25 bg-red-400/10 text-red-100"}`}
    >
      {state.message}
    </p>
  );
}

function HiddenIdentity({ enquiryId, version }: { enquiryId: string; version: number }) {
  return <><input type="hidden" name="enquiryId" value={enquiryId} /><input type="hidden" name="version" value={version} /></>;
}

const validTransitions: Record<EnquiryStatus, EnquiryStatus[]> = {
  new: ["in_progress", "closed"],
  in_progress: ["waiting", "resolved", "closed"],
  waiting: ["in_progress", "resolved", "closed"],
  resolved: ["closed", "in_progress"],
  closed: ["in_progress"],
};

const statusLabels: Record<EnquiryStatus, string> = {
  new: "New",
  in_progress: "In progress",
  waiting: "Waiting",
  resolved: "Resolved",
  closed: "Closed",
};

export function StatusAction({ enquiryId, version, status }: { enquiryId: string; version: number; status: EnquiryStatus }) {
  const [state, action, pending] = useActionState(setEnquiryStatusAction, initialState);
  return (
    <form action={action}>
      <HiddenIdentity enquiryId={enquiryId} version={version} />
      <label htmlFor="enquiry-status" className="text-sm font-medium text-slate-200">Change status</label>
      <select id="enquiry-status" name="status" defaultValue="" required disabled={pending} className={controlClass}>
        <option value="" disabled>Choose next status</option>
        {validTransitions[status].map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
      </select>
      <button type="submit" disabled={pending} className={buttonClass}>{pending ? "Updating…" : "Update status"}</button>
      <Feedback state={state} />
    </form>
  );
}

export function PriorityAction({ enquiryId, version, priority }: { enquiryId: string; version: number; priority: EnquiryPriority }) {
  const [state, action, pending] = useActionState(setEnquiryPriorityAction, initialState);
  return (
    <form action={action}>
      <HiddenIdentity enquiryId={enquiryId} version={version} />
      <label htmlFor="enquiry-priority" className="text-sm font-medium text-slate-200">Priority</label>
      <select id="enquiry-priority" name="priority" defaultValue={priority} disabled={pending} className={controlClass}>
        <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
      </select>
      <button type="submit" disabled={pending} className={buttonClass}>{pending ? "Updating…" : "Update priority"}</button>
      <Feedback state={state} />
    </form>
  );
}

export function AssignmentAction({ enquiryId, version, assignedTo, staff }: { enquiryId: string; version: number; assignedTo: string | null; staff: AssignableStaff[] }) {
  const [state, action, pending] = useActionState(assignEnquiryAction, initialState);
  return (
    <form action={action}>
      <HiddenIdentity enquiryId={enquiryId} version={version} />
      <label htmlFor="enquiry-assignee" className="text-sm font-medium text-slate-200">Assignee</label>
      <select id="enquiry-assignee" name="assigneeId" defaultValue={assignedTo ?? ""} disabled={pending} className={controlClass}>
        <option value="">Unassigned</option>
        {staff.map((person) => <option key={person.userId} value={person.userId}>{person.displayName} ({person.role})</option>)}
      </select>
      <button type="submit" disabled={pending} className={buttonClass}>{pending ? "Updating…" : "Update assignment"}</button>
      <Feedback state={state} />
    </form>
  );
}

export function AddNoteAction({ enquiryId, version }: { enquiryId: string; version: number }) {
  const [state, action, pending] = useActionState(addEnquiryNoteAction, initialState);
  return (
    <form action={action}>
      <HiddenIdentity enquiryId={enquiryId} version={version} />
      <label htmlFor="enquiry-note" className="text-sm font-medium text-slate-200">Add internal note</label>
      <textarea id="enquiry-note" name="note" rows={5} required maxLength={4000} disabled={pending} className={controlClass} aria-describedby="enquiry-note-description" />
      <p id="enquiry-note-description" className="mt-2 text-xs leading-5 text-slate-400">Internal plain text only. Never visible to the customer. Maximum 4,000 characters.</p>
      <button type="submit" disabled={pending} className={buttonClass}>{pending ? "Adding…" : "Add internal note"}</button>
      <Feedback state={state} />
    </form>
  );
}

export function EditNoteAction({ enquiryId, version, note }: { enquiryId: string; version: number; note: EnquiryNote }) {
  const [state, action, pending] = useActionState(editEnquiryNoteAction, initialState);
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-xs font-semibold text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Edit your note</summary>
      <form action={action} className="mt-3">
        <HiddenIdentity enquiryId={enquiryId} version={version} />
        <input type="hidden" name="noteId" value={note.id} />
        <label htmlFor={`edit-note-${note.id}`} className="sr-only">Edit internal note</label>
        <textarea id={`edit-note-${note.id}`} name="note" defaultValue={note.body} rows={4} required maxLength={4000} disabled={pending} className={controlClass} />
        <button type="submit" disabled={pending} className={buttonClass}>{pending ? "Saving…" : "Save note"}</button>
        <Feedback state={state} />
      </form>
    </details>
  );
}
