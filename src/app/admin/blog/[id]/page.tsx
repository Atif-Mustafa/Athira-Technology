import type { Metadata } from "next";
import { CmsEditView } from "../../../../components/admin/cms/CmsRouteViews";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit post | Admin CMS", robots: { index: false, follow: false } };
export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <CmsEditView kind="post" id={id} />; }
