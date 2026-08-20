import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CmsPage, CmsService } from "@/server/cms/types";

const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: replaceMock }) }));
vi.mock("@/app/admin/cms/actions", () => ({
  savePageAction: vi.fn(),
  savePostAction: vi.fn(),
  saveServiceAction: vi.fn(),
  savePricingPlanAction: vi.fn(),
}));

import { CmsEditorForm } from "@/components/admin/cms/CmsEditorForm";

const base = {
  id: "22222222-2222-4222-8222-222222222222",
  slug: "about",
  createdAt: "2026-08-19T00:00:00.000Z",
  updatedAt: "2026-08-19T01:00:00.000Z",
  version: 3,
  attribution: { createdBy: "Admin A", updatedBy: "Editor A", publishedBy: null },
};

const page: CmsPage = {
  ...base,
  kind: "page",
  title: "About",
  summary: "About Athira Technology",
  body: "## About",
  status: "draft",
  seoTitle: null,
  seoDescription: null,
  canonicalPath: "/about",
  publishedAt: null,
};

const service: CmsService = {
  ...base,
  kind: "service",
  title: "Quality engineering",
  summary: "Quality support",
  description: "",
  businessProblem: "Late feedback",
  scope: "Test strategy",
  deliverables: ["Quality strategy"],
  engagementModel: "Assessment",
  icon: "quality",
  sortOrder: 10,
  active: true,
  seoTitle: null,
  seoDescription: null,
};

describe("CMS editor role-aware UI", () => {
  beforeEach(() => replaceMock.mockReset());

  it("renders viewer access as genuinely read-only", () => {
    render(<CmsEditorForm kind="service" record={service} canEdit={false} isAdmin={false} />);
    expect(screen.getByRole("note")).toHaveTextContent("read-only");
    expect(screen.getByLabelText(/Service title/)).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Update" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Make inactive" })).not.toBeInTheDocument();
  });

  it("gives editors clear save, publish, and private preview controls", () => {
    render(<CmsEditorForm kind="page" record={page} canEdit isAdmin={false} />);
    expect(screen.getByRole("button", { name: "Update" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Publish" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Preview draft" })).toHaveAttribute("href", `/admin/preview/page/${page.id}`);
    expect(screen.queryByRole("button", { name: "Archive" })).not.toBeInTheDocument();
  });

  it("keeps archived content read-only for editors", () => {
    const archivedPage: CmsPage = { ...page, status: "archived" };
    render(<CmsEditorForm kind="page" record={archivedPage} canEdit isAdmin={false} />);
    expect(screen.getByRole("note")).toHaveTextContent("administrator must restore");
    expect(screen.getByLabelText(/Page title/)).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Update" })).not.toBeInTheDocument();
  });

  it("requires an accessible confirmation before an admin archives content", async () => {
    const user = userEvent.setup();
    render(<CmsEditorForm kind="page" record={page} canEdit isAdmin />);
    const trigger = screen.getByRole("button", { name: "Archive" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Archive this content?" })).toBeVisible();
    const cancel = screen.getByRole("button", { name: "Cancel" });
    const confirm = screen.getByRole("button", { name: "Archive content" });
    expect(cancel).toHaveFocus();
    await user.tab({ shift: true });
    expect(confirm).toHaveFocus();
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
