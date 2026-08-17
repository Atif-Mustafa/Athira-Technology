"use client";

import { useActionState } from "react";
import { signInAction, type LoginActionState } from "../../app/admin/actions";

const initialState: LoginActionState = { kind: "idle" };

type LoginFormProps = {
  nextPath: string;
  configurationAvailable: boolean;
};

export function LoginForm({ nextPath, configurationAvailable }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);
  const configurationMessage = "Admin authentication is not configured for this environment.";
  const message = !configurationAvailable
    ? configurationMessage
    : state.kind === "configuration"
      ? state.message ?? configurationMessage
      : state.message;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={nextPath} />
      {message ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm leading-6 text-amber-100"
        >
          {message}
        </div>
      ) : null}
      <div>
        <label htmlFor="admin-email" className="block text-sm font-medium text-slate-200">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={isPending || !configurationAvailable}
          className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="block text-sm font-medium text-slate-200">
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending || !configurationAvailable}
          className="mt-2 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
      <button
        type="submit"
        disabled={isPending || !configurationAvailable}
        className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
