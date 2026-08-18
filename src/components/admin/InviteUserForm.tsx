"use client";

import { useActionState, useEffect, useRef } from "react";
import { inviteUserAction, type AdminActionState } from "../../app/admin/users/actions";

const initialState: AdminActionState = { kind: "idle" };

export function InviteUserForm() {
  const [state, formAction, isPending] = useActionState(inviteUserAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.kind === "success") formRef.current?.reset();
  }, [state.kind]);

  return (
    <form ref={formRef} action={formAction} noValidate className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto] lg:items-end">
      <div>
        <label htmlFor="invite-email" className="block text-sm font-medium text-slate-200">Email</label>
        <input id="invite-email" name="email" type="email" autoComplete="email" maxLength={254} required disabled={isPending}
          className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:opacity-60"
          placeholder="colleague@example.com" />
      </div>
      <div>
        <label htmlFor="invite-display-name" className="block text-sm font-medium text-slate-200">Display name <span className="font-normal text-slate-500">(optional)</span></label>
        <input id="invite-display-name" name="displayName" type="text" maxLength={100} disabled={isPending}
          className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:opacity-60"
          placeholder="Ada Lovelace" />
      </div>
      <div>
        <label htmlFor="invite-role" className="block text-sm font-medium text-slate-200">Initial role</label>
        <select id="invite-role" name="role" defaultValue="viewer" disabled={isPending}
          className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:opacity-60">
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" disabled={isPending}
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? "Sending..." : "Send invitation"}
      </button>
      {state.kind !== "idle" ? (
        <p role={state.kind === "success" ? "status" : "alert"} aria-live="polite"
          className={state.kind === "success" ? "lg:col-span-4 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-100" : state.kind === "warning" ? "lg:col-span-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-sm text-amber-100" : "lg:col-span-4 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-100"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
