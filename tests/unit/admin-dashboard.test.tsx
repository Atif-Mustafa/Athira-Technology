import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminDashboardPage from "@/app/admin/dashboard/page";
import AdminLayout from "@/app/admin/layout";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

vi.mock("@/server/auth/guards", () => ({
  requireAuthenticatedUser: vi.fn().mockResolvedValue({
    configurationAvailable: true,
    user: { id: "user-1", email: "ada@example.com" },
    profile: { display_name: "Ada", status: "active" },
    role: "viewer",
    issue: null,
  }),
}));

describe("authenticated admin UX concept", () => {
  it("keeps the shell honest about its auth foundation and planned scope", () => {
    render(
      <AdminLayout>
        <div>Dashboard content</div>
      </AdminLayout>,
    );

    expect(screen.getByRole("note", { name: "Admin authentication boundary" })).toHaveTextContent(
      "Authentication and role-based access are connected",
    );
    expect(screen.getByText("Auth foundation only")).toBeInTheDocument();
    expect(screen.queryByText("Demo user")).not.toBeInTheDocument();
    expect(screen.queryByText("No signed-in account")).not.toBeInTheDocument();
  });

  it("marks Overview active and the remaining navigation as planned", () => {
    render(<AdminNavigation ariaLabel="Test admin navigation" />);

    const navigation = screen.getByRole("navigation", { name: "Test admin navigation" });
    expect(within(navigation).getByRole("link", { name: /Overview/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(navigation).getByRole("link", { name: /Overview/ })).toHaveAttribute(
      "href",
      "/admin/dashboard",
    );
    expect(within(navigation).getAllByText("Planned")).toHaveLength(8);
  });

  it("renders sample data only after the authenticated guard allows access", async () => {
    render(await AdminDashboardPage());

    expect(screen.getByText("Ada").closest("div")).toHaveTextContent("Signed in as Ada · Viewer role");
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.getByText("No live telemetry connected")).toBeInTheDocument();
    expect(screen.getByText("No operational metrics")).toBeInTheDocument();
    expect(screen.getAllByText("Planned module")).toHaveLength(4);
    expect(screen.getByText("Illustrative analytics")).toBeInTheDocument();
    expect(screen.getByText("Admin backend").closest("li")).toHaveTextContent("Not implemented");
    expect(screen.getByText("CMS").closest("li")).toHaveTextContent("Not implemented");
    expect(screen.getByText("Analytics backend").closest("li")).toHaveTextContent("Not implemented");
    expect(screen.getByText("Contact API").closest("li")).toHaveTextContent("Configured");
    expect(screen.getByText("Rate limiting").closest("li")).toHaveTextContent("Configured");
  });
});
