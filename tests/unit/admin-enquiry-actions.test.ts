import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireEditorMock, createServerClientMock, revalidatePathMock } = vi.hoisted(() => ({
  requireEditorMock: vi.fn(),
  createServerClientMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("@/server/enquiries/guards", () => ({ requireEnquiryEditor: requireEditorMock }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: createServerClientMock }));

import {
  addEnquiryNoteAction,
  assignEnquiryAction,
  setEnquiryPriorityAction,
  setEnquiryStatusAction,
} from "@/app/admin/enquiries/actions";

const enquiryId = "11111111-1111-4111-8111-111111111111";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function mutation(values: Record<string, string>) {
  return form({ enquiryId, version: "4", ...values });
}

describe("admin enquiry Server Actions", () => {
  beforeEach(() => {
    requireEditorMock.mockReset().mockResolvedValue({ role: "editor" });
    createServerClientMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("rechecks authorization before opening a mutation client", async () => {
    requireEditorMock.mockRejectedValueOnce(new Error("redirect:/admin/forbidden"));
    await expect(
      setEnquiryStatusAction({ kind: "idle" }, mutation({ status: "in_progress" })),
    ).rejects.toThrow("redirect:/admin/forbidden");
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it("passes the optimistic version to the atomic status RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 5, error: null });
    createServerClientMock.mockResolvedValue({ rpc });

    await expect(
      setEnquiryStatusAction({ kind: "idle" }, mutation({ status: "in_progress" })),
    ).resolves.toEqual({ kind: "success", message: "Status updated." });
    expect(rpc).toHaveBeenCalledWith("enquiry_set_status", {
      target_enquiry_id: enquiryId,
      expected_version: 4,
      new_status: "in_progress",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(`/admin/enquiries/${enquiryId}`);
  });

  it("returns the safe stale-write conflict message", async () => {
    createServerClientMock.mockResolvedValue({
      rpc: vi.fn().mockResolvedValue({ data: null, error: { code: "40001", message: "enquiry_conflict" } }),
    });
    await expect(
      setEnquiryPriorityAction({ kind: "idle" }, mutation({ priority: "high" })),
    ).resolves.toEqual({
      kind: "conflict",
      message: "This enquiry changed since you opened it. Reload before updating.",
    });
  });

  it("rejects malformed assignments and notes before PostgreSQL", async () => {
    await expect(
      assignEnquiryAction({ kind: "idle" }, mutation({ assigneeId: "not-a-user" })),
    ).resolves.toMatchObject({ kind: "error" });
    await expect(
      addEnquiryNoteAction({ kind: "idle" }, mutation({ note: " ".repeat(5) })),
    ).resolves.toMatchObject({ kind: "error" });
    expect(createServerClientMock).not.toHaveBeenCalled();
  });
});
