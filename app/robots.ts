import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Account/auth pages have nothing for a crawler to index; /login is a
      // client component and can't carry its own noindex metadata, so it's
      // excluded here instead.
      disallow: ["/api/", "/account", "/scenes", "/login", "/auth/"],
    },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
