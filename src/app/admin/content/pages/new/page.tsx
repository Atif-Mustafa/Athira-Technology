import type { Metadata } from "next";
import { CmsNewView } from "../../../../../components/admin/cms/CmsRouteViews";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create page | Admin CMS", robots: { index: false, follow: false } };
export default function NewPagePage() { return <CmsNewView kind="page" />; }
