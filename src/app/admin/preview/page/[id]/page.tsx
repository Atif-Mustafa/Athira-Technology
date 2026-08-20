import type { Metadata } from "next";
import { CmsPreview } from "../../../../../components/admin/cms/CmsPreview";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Page preview | Admin CMS", robots: { index: false, follow: false, nocache: true } };
export default async function PagePreviewPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <CmsPreview kind="page" id={id} />; }
