"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { changeUserRoleAction, setUserStatusAction, type AdminActionState } from "../../app/admin/users/actions";
import { roleLabel, type AppRole } from "../../server/auth/roles";

type Props = {
  userId: string;
  currentRole: AppRole | null;
  status: "active" | "disabled";
  isSelf: boolean;
};

type DialogState =
  | { kind: "role"; role: AppRole }
  | { kind: "status"; status: "active" | "disabled" }
  | null;

const initialState: AdminActionState = { kind: "idle" };

export function UserManagementActions({ userId, currentRole, status, isSelf }: Props) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [roleState, roleAction, rolePending] = useActionState(changeUserRoleAction, initialState);
  const [statusState, statusAction, statusPending] = useActionState(setUserStatusAction, initialState);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (roleState.kind === "success" || statusState.kind === "success") window.setTimeout(() => setDialog(null), 0);
  }, [roleState.kind, statusState.kind]);

  useEffect(() => {
    if (dialog) {
      const target = triggerRef.current;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setDialog(null);
          target?.focus();
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [dialog]);

  if (isSelf) {
    return <p className="text-sm text-amber-200">Your own role and access cannot be changed here.</p>;
  }

  const state = roleState.kind !== "idle" ? roleState : statusState;
  const pending = rolePending || statusPending;

  return (
    <div className="space-y-4">
      {state.kind !== "idle" ? (
        <p role={state.kind === "success" ? "status" : "alert"} aria-live="polite"
          className={state.kind === "success" ? "rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-100" : "rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100"}>
          {state.message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button ref={triggerRef} type="button" disabled={pending}
          onClick={() => setDialog({ kind: "role", role: currentRole ?? "viewer" })}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:opacity-60">
          Change role
        </button>
        {status === "disabled" ? (
          <button type="button" disabled={pending} onClick={() => setDialog({ kind: "status", status: "active" })}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:opacity-60">
            Enable access
          </button>
        ) : (
          <button type="button" disabled={pending} onClick={() => setDialog({ kind: "status", status: "disabled" })}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm font-semibold text-red-100 hover:bg-red-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-60">
            Disable access
          </button>
        )}
      </div>

      {dialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="user-action-dialog-title"
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/40">
            <h2 id="user-action-dialog-title" className="text-xl font-semibold text-white">
              {dialog.kind === "role" ? "Confirm role change" : dialog.status === "disabled" ? "Disable access?" : "Enable access?"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {dialog.kind === "role"
                ? "The selected role will apply on the next authorization check."
                : dialog.status === "disabled"
                  ? "This user will no longer be able to access the admin workspace."
                  : "This user will be able to access the admin workspace again if their role is still valid."}
            </p>
            {dialog.kind === "role" ? (
              <form action={roleAction} className="mt-5 space-y-4">
                <input type="hidden" name="userId" value={userId} />
                <div>
                  <label htmlFor="new-user-role" className="block text-sm font-medium text-slate-200">New role</label>
                  <select id="new-user-role" name="role" defaultValue={dialog.role} disabled={rolePending}
                    className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40">
                    <option value="viewer">{roleLabel("viewer")}</option>
                    <option value="editor">{roleLabel("editor")}</option>
                    <option value="admin">{roleLabel("admin")}</option>
                  </select>
                </div>
                {roleState.kind === "error" ? <p role="alert" className="text-sm text-red-200">{roleState.message}</p> : null}
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setDialog(null)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500">Cancel</button>
                  <button type="submit" disabled={rolePending} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60">{rolePending ? "Saving..." : "Confirm role"}</button>
                </div>
              </form>
            ) : (
              <form action={statusAction} className="mt-5">
                <input type="hidden" name="userId" value={userId} />
                <input type="hidden" name="status" value={dialog.status} />
                {statusState.kind === "error" ? <p role="alert" className="mb-4 text-sm text-red-200">{statusState.message}</p> : null}
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setDialog(null)} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500">Cancel</button>
                  <button type="submit" disabled={statusPending} className={dialog.status === "disabled" ? "rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60" : "rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"}>{statusPending ? "Saving..." : dialog.status === "disabled" ? "Disable access" : "Enable access"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
