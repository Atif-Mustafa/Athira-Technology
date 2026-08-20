import type { Metadata } from "next";
import { CmsEditView } from "../../../../components/admin/cms/CmsRouteViews";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit service | Admin CMS", robots: { index: false, follow: false } };
export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <CmsEditView kind="service" id={id} />; }
