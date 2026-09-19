import { ArticleIndex } from "@/components/article/ArticleIndex";
import { pageMetadata } from "@/lib/seo/metadata";
import { SECTION_LABEL } from "@/lib/articles";

export const metadata = pageMetadata({
  path: "/guides",
  title: "Guides to Interactive 3D Photos",
  description: SECTION_LABEL.guides.intro,
});

export default function GuidesIndex() {
  return <ArticleIndex section="guides" />;
}
