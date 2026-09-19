import { ArticleIndex } from "@/components/article/ArticleIndex";
import { pageMetadata } from "@/lib/seo/metadata";
import { SECTION_LABEL } from "@/lib/articles";

export const metadata = pageMetadata({
  path: "/compare",
  title: "Compare 3D Photo Tools",
  description: SECTION_LABEL.compare.intro,
});

export default function CompareIndex() {
  return <ArticleIndex section="compare" />;
}
