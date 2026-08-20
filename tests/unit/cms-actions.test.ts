import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireContentEditorMock,
  createServerClientMock,
  revalidatePathMock,
  updateTagMock,
} = vi.hoisted(() => ({
  requireContentEditorMock: vi.fn(),
  createServerClientMock: vi.fn(),
  revalidatePathMock: vi.fn(),
  updateTagMock: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock, updateTag: updateTagMock }));
vi.mock("@/server/cms/guards", () => ({ requireContentEditor: requireContentEditorMock }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: createServerClientMock }));
vi.mock("@/server/cms/public", () => ({
  CMS_CACHE_TAGS: { pages: "cms:pages", posts: "cms:posts", services: "cms:services", pricing: "cms:pricing" },
}));

import {
  savePageAction,
  savePostAction,
  savePricingPlanAction,
} from "@/app/admin/cms/actions";

const editor = {
  configurationAvailable: true as const,
  user: { id: "11111111-1111-4111-8111-111111111111" },
  profile: { display_name: "Editor", status: "active" as const },
  role: "editor" as const,
  issue: null,
};

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

function postForm(overrides: Record<string, string> = {}) {
  return form({
    version: "1",
    id: "22222222-2222-4222-8222-222222222222",
    title: "Safe post",
    slug: "safe-post",
    excerpt: "A bounded summary.",
    body: "## Body\n\nSafe content.",
    status: "draft",
    authorName: "Editorial team",
    category: "Engineering",
    readingTime: "4 min read",
    seoTitle: "",
    seoDescription: "",
    intent: "publish",
    ...overrides,
  });
}

describe("CMS server actions", () => {
  beforeEach(() => {
    requireContentEditorMock.mockReset();
    requireContentEditorMock.mockResolvedValue(editor);
    createServerClientMock.mockReset();
    revalidatePathMock.mockReset();
    updateTagMock.mockReset();
  });

  it("rechecks editor authorization before every mutation boundary", async () => {
    requireContentEditorMock.mockRejectedValueOnce(new Error("redirect:/admin/forbidden"));
    await expect(savePostAction({ kind: "idle" }, postForm())).rejects.toThrow("redirect:/admin/forbidden");
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it("passes the expected version to PostgreSQL and invalidates only blog surfaces", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{ entity_id: "22222222-2222-4222-8222-222222222222", entity_version: 2 }],
      error: null,
    });
    createServerClientMock.mockResolvedValue({ rpc });

    await expect(savePostAction({ kind: "idle" }, postForm())).resolves.toMatchObject({
      kind: "success",
      version: 2,
    });
    expect(rpc).toHaveBeenCalledWith("cms_save_post", expect.objectContaining({
      expected_version: 1,
      new_status: "published",
      new_slug: "safe-post",
    }));
    expect(updateTagMock).toHaveBeenCalledWith("cms:posts");
    expect(revalidatePathMock).toHaveBeenCalledWith("/blog");
    expect(revalidatePathMock).toHaveBeenCalledWith("/blog/safe-post");
    expect(revalidatePathMock).not.toHaveBeenCalledWith("/services");
  });

  it("returns the explicit optimistic-concurrency message", async () => {
    createServerClientMock.mockResolvedValue({
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "cms_conflict", code: "40001" } }),
    });
    await expect(savePostAction({ kind: "idle" }, postForm())).resolves.toEqual({
      kind: "error",
      message: "This content changed since you opened it. Reload before saving.",
    });
  });

  it("denies editor archive requests before reaching PostgreSQL", async () => {
    await expect(savePostAction({ kind: "idle" }, postForm({ intent: "archive" }))).resolves.toEqual({
      kind: "error",
      message: "Only an administrator can archive posts.",
    });
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it("rejects reserved page slugs before opening a database client", async () => {
    const data = form({
      version: "0",
      title: "Private route",
      slug: "admin",
      summary: "Summary",
      body: "Body",
      status: "draft",
      canonicalPath: "/admin",
      seoTitle: "",
      seoDescription: "",
      intent: "draft",
    });
    await expect(savePageAction({ kind: "idle" }, data)).resolves.toMatchObject({ kind: "error" });
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it("rejects script CTA schemes before opening a database client", async () => {
    const data = form({
      version: "0",
      name: "Growth",
      slug: "growth",
      label: "Quote",
      targetUser: "Teams",
      description: "Description",
      features: "Feature",
      limitations: "Boundary",
      ctaLabel: "Start",
      ctaHref: "javascript:alert(1)",
      sortOrder: "10",
      active: "true",
      intent: "save",
    });
    await expect(savePricingPlanAction({ kind: "idle" }, data)).resolves.toMatchObject({ kind: "error" });
    expect(createServerClientMock).not.toHaveBeenCalled();
  });
});
