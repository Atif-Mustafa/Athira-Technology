import type { Metadata } from "next";
import { CmsPreview } from "../../../../../components/admin/cms/CmsPreview";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Post preview | Admin CMS", robots: { index: false, follow: false, nocache: true } };
export default async function PostPreviewPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <CmsPreview kind="post" id={id} />; }
