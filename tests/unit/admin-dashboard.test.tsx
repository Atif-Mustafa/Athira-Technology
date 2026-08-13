import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AdminDashboardPage from "@/app/admin/dashboard/page";
import AdminLayout from "@/app/admin/layout";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

describe("static admin UX concept", () => {
  it("keeps the shell and navigation explicitly non-production", () => {
    render(
      <AdminLayout>
        <div>Dashboard content</div>
      </AdminLayout>,
    );

    expect(screen.getByRole("note", { name: "Admin demonstration limitation" })).toHaveTextContent(
      "Admin UX demo — static sample data only",
    );
    expect(screen.getByText("Demo user")).toBeInTheDocument();
    expect(screen.getByText("No signed-in account")).toBeInTheDocument();
    expect(screen.queryByText(/sign out|last login|account settings/i)).not.toBeInTheDocument();
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

  it("labels sample data, planned modules, and implementation boundaries honestly", () => {
    render(<AdminDashboardPage />);

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
