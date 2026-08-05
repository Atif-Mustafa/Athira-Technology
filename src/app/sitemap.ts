import { MetadataRoute } from "next";
import { agentsData } from "../data/agents";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://athiratech.example.com";

  const agentUrls = agentsData.map((agent) => ({
    url: `${baseUrl}/agents/${agent.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/agents`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...agentUrls,
  ];
}
