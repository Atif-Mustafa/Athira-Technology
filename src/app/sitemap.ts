import { MetadataRoute } from "next";
import { absoluteUrl } from "../config/site";
import { agentsData } from "../content/agents";

export default function sitemap(): MetadataRoute.Sitemap {
  const agentUrls = agentsData.map((agent) => ({
    url: absoluteUrl(`/agents/${agent.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/agents"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...agentUrls,
  ];
}
