import type { MetadataRoute } from "next";
import { fetchAllPublishedScoreSlugs } from "@/lib/fetch-score";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const scores = await fetchAllPublishedScoreSlugs();

  const scoreEntries: MetadataRoute.Sitemap = scores.map((score) => ({
    url: `${siteUrl}/scores/${score.slug}`,
    lastModified: score.created_at,
  }));

  return [
    {
      url: siteUrl,
      changeFrequency: "daily",
    },
    ...scoreEntries,
  ];
}
