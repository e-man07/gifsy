// Who is behind Gifsy. Exists so that a page on this site names the humans
// operating it — nothing did before — and so bylines and the Person nodes in
// the structured data have a URL to point at.

import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { CONTENT_NAV } from "@/components/article/ArticleLayout";
import { SiteFooter } from "@/components/SiteFooter";
import { pageMetadata } from "@/lib/seo/metadata";
import { FOUNDERS, GITHUB_URL, PRODUCT_HUNT_URL } from "@/lib/founders";
import { CONTACT_EMAIL } from "@/lib/legal";
import { JsonLd, breadcrumbNode } from "@/lib/seo/json-ld";

export const metadata = pageMetadata({
  path: "/about",
  title: "About",
  description:
    "Gifsy is built by Aman Jha and Priyanshu Tiwari. One photo in, an interactive 3D photo out — with the AI running in your browser and an embed you can paste into any site.",
});

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-background">
      <JsonLd graph={[breadcrumbNode([{ name: "Gifsy", path: "/" }, { name: "About", path: "/about" }])]} />
      <section className="border-b border-foreground/10 bg-panel">
        <SiteNav links={CONTENT_NAV} />
        <div className="mx-auto w-full max-w-3xl px-5 pb-10 pt-6 sm:px-8 sm:pb-14 sm:pt-10">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep">About</p>
          <h1 className="mt-3 font-editorial text-4xl text-foreground sm:text-5xl">
            Two people, one photo, a scene you can drag.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted sm:text-base">
            Gifsy turns a single photo into an interactive 3D photo in your browser and hands
            you an <code>&lt;iframe&gt;</code> you can paste into Webflow, Framer, Squarespace
            or any site. It also makes GIFs and Telegram stickers, free, with no account.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <div className="legal">
          <h2>Who makes it</h2>
          <ul>
            {FOUNDERS.map((f) => (
              <li key={f.x}>
                <strong>{f.name}</strong> — {f.role}.{" "}
                <a href={f.x} rel="me noopener" target="_blank">
                  {f.x.replace("https://", "")}
                </a>
              </li>
            ))}
          </ul>
          <p>
            There is no company behind Gifsy yet; the two of us operate it as individuals
            (see the <Link href="/terms">terms</Link>). Purchases are handled by Dodo Payments
            as merchant of record.
          </p>

          <h2>What we believe about 3D photos</h2>
          <p>
            A single photo does not contain a 3D model, and we don&apos;t pretend it does.
            Gifsy estimates a depth map (Depth Anything V2), separates the subject (ISNet),
            paints a clean backdrop behind it (LaMa, once, at publish), and renders two
            displaced planes with a shallow camera orbit. That is honest, fast, and — because
            the viewer never runs any AI — light enough to embed on a real website. It also
            has limits: the orbit is about ±23°, frame-filling subjects smear at the edges,
            and busy backgrounds separate poorly. We say so in the app rather than after
            you&apos;ve paid.
          </p>

          <h2>Where your photo goes</h2>
          <p>
            GIFs and stickers never leave your browser. For 3D, the photo stays in your
            browser too: on the free plan the second half of the depth model runs on our
            server, fed intermediate activations rather than the image; on Pro it all runs
            locally. Publishing is the one step that uploads the finished scene, and
            published scenes are public. The full account is in the{" "}
            <Link href="/privacy">privacy policy</Link>.
          </p>

          <h2>Elsewhere</h2>
          <ul>
            <li>
              Source on{" "}
              <a href={GITHUB_URL} rel="noopener" target="_blank">
                GitHub
              </a>
            </li>
            <li>
              Launch on{" "}
              <a href={PRODUCT_HUNT_URL} rel="noopener" target="_blank">
                Product Hunt
              </a>
            </li>
            <li>
              Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
          </ul>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
