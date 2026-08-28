import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminDashboardPage from "@/app/admin/dashboard/page";
import AdminLayout from "@/app/admin/layout";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

vi.mock("server-only", () => ({}));
vi.mock("@/server/enquiries/guards", () => ({
  requireEnquiryViewer: vi.fn().mockResolvedValue({
    configurationAvailable: true,
    user: { id: "user-1", email: "ada@example.com" },
    profile: { display_name: "Ada", status: "active" },
    role: "viewer",
    issue: null,
  }),
}));
vi.mock("@/server/enquiries/data", () => ({
  getEnquiryCounts: vi.fn().mockResolvedValue({ new: 3, open: 7, unassigned: 2, notificationFailures: 1 }),
}));

vi.mock("@/server/auth/guards", () => ({
  requireAuthenticatedUser: vi.fn().mockResolvedValue({
    configurationAvailable: true,
    user: { id: "user-1", email: "ada@example.com" },
    profile: { display_name: "Ada", status: "active" },
    role: "viewer",
    issue: null,
  }),
  getAuthContext: vi.fn().mockResolvedValue({
    configurationAvailable: true,
    user: { id: "user-1", email: "ada@example.com" },
    profile: { display_name: "Ada", status: "active" },
    role: "viewer",
    issue: null,
  }),
}));

describe("authenticated admin UX concept", () => {
  it("keeps the shell honest about its implemented and pending scope", async () => {
    render(await AdminLayout({
      children: <div>Dashboard content</div>,
    }));

    expect(screen.getByRole("note", { name: "Admin authentication boundary" })).toHaveTextContent(
      "User management and CMS workflows are implemented",
    );
    expect(screen.getByText("CMS workspace")).toBeInTheDocument();
    expect(screen.queryByText("Demo user")).not.toBeInTheDocument();
    expect(screen.queryByText("No signed-in account")).not.toBeInTheDocument();
  });

  it("marks implemented admin modules as active", () => {
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
    expect(within(navigation).getByRole("link", { name: /Content/ })).toHaveAttribute("href", "/admin/content");
    expect(within(navigation).getByRole("link", { name: /Blog/ })).toHaveAttribute("href", "/admin/blog");
    expect(within(navigation).getByRole("link", { name: /Enquiries/ })).toHaveAttribute("href", "/admin/enquiries");
    expect(within(navigation).getAllByText("Planned")).toHaveLength(5);
  });

  it("renders sample data only after the authenticated guard allows access", async () => {
    render(await AdminDashboardPage());

    expect(screen.getByText("Ada").closest("div")).toHaveTextContent("Signed in as Ada · Viewer role");
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.getByText("No live telemetry connected")).toBeInTheDocument();
    expect(screen.getByText("New enquiries").closest("div")).toHaveTextContent("3");
    expect(screen.getByText("Notification failures").closest("div")).toHaveTextContent("1");
    expect(screen.getAllByText("Planned module")).toHaveLength(1);
    expect(screen.getByText("Implemented module")).toBeInTheDocument();
    expect(screen.getByText("Illustrative analytics")).toBeInTheDocument();
    expect(screen.getAllByText("User management").length).toBeGreaterThan(0);
    expect(screen.getByText("CMS").closest("li")).toHaveTextContent("Implemented");
    expect(screen.getByText("Analytics backend").closest("li")).toHaveTextContent("Not implemented");
    expect(screen.getByText("Contact API").closest("li")).toHaveTextContent("Configured");
    expect(screen.getByText("Rate limiting").closest("li")).toHaveTextContent("Configured");
  });
});
