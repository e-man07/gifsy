import { ArticleIndex } from "@/components/article/ArticleIndex";
import { pageMetadata } from "@/lib/seo/metadata";
import { SECTION_LABEL } from "@/lib/articles";

export const metadata = pageMetadata({
  path: "/alternatives",
  title: "3D Photo Tool Alternatives",
  description: SECTION_LABEL.alternatives.intro,
});

export default function AlternativesIndex() {
  return <ArticleIndex section="alternatives" />;
}
