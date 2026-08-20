import type { Metadata } from "next";
import { CmsListView } from "../../../components/admin/cms/CmsRouteViews";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Blog | Admin CMS", robots: { index: false, follow: false } };
export default function AdminBlogPage() { return <CmsListView kind="post" />; }
