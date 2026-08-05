import { MetadataRoute } from "next";
import { absoluteUrl } from "../config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
