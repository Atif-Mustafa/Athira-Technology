import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoginForm } from "@/components/admin/LoginForm";
import AdminForbiddenPage from "@/app/admin/forbidden/page";

describe("admin authentication UI", () => {
  it("renders an accessible email/password login without signup controls", () => {
    render(<LoginForm nextPath="/admin/dashboard" configurationAvailable />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
    expect(screen.queryByText(/sign up|create admin/i)).not.toBeInTheDocument();
  });

  it("shows a safe configuration-unavailable state", () => {
    render(<LoginForm nextPath="/admin/dashboard" configurationAvailable={false} />);

    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
  });

  it("provides an accessible forbidden state with logout and return navigation", () => {
    render(<AdminForbiddenPage />);

    expect(screen.getByRole("heading", { name: "This workspace is restricted" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute("href", "/");
  });
});
