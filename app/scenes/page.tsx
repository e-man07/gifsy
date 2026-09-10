// "My scenes" — a signed-in creator's published 2.5D scenes, read from Postgres
// (RLS-scoped to the owner). Auth-gated: redirects to /login when signed out.

import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My scenes" };

interface SceneRow {
  id: string;
  image_url: string | null;
  /** 400px preview (0004_scene_thumbnails.sql); null on scenes published
   *  before thumbnails existed, so the grid falls back to image_url. */
  thumb_url: string | null;
  created_at: string;
  watermark: boolean;
}

export default async function MyScenesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/scenes");

  const { data } = await supabase
    .from("scenes")
    .select("id,image_url,thumb_url,created_at,watermark")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  const scenes = (data ?? []) as SceneRow[];

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-background">
      <section className="border-b border-foreground/10 bg-panel">
        <SiteNav />

        <div className="mx-auto w-full max-w-5xl px-5 pb-10 pt-6 sm:px-8 sm:pb-12 sm:pt-8">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-sky-deep">
            Your account
          </p>
          <h1 className="mt-2 font-editorial text-4xl text-foreground sm:text-5xl">
            My scenes
          </h1>
          <Link href="/account" className="mt-3 inline-block text-sm text-muted underline decoration-dotted hover:text-sky-deep">
            {user.email}
          </Link>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">

      {scenes.length === 0 ? (
        <div className="card rounded-2xl bg-panel p-10 text-center">
          <p className="font-display text-lg text-foreground">No published scenes yet</p>
          <p className="mt-2 text-sm text-muted">
            Make a 3D scene and hit Publish — it&apos;ll show up here with a shareable link and embed code.
          </p>
          <Link href="/" className="btn mt-5 inline-block rounded-xl bg-grass px-5 py-2.5 font-display text-sm text-ink">
            Create one
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {scenes.map((s) => (
            <Link
              key={s.id}
              href={`/s/${s.id}`}
              className="card group overflow-hidden rounded-xl bg-panel transition hover:-translate-y-0.5"
            >
              <div className="aspect-square w-full overflow-hidden bg-surface">
                {s.thumb_url ?? s.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.thumb_url ?? s.image_url!}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="font-display text-[11px] uppercase tracking-wide text-muted">
                  {new Date(s.created_at).toLocaleDateString()}
                </span>
                {s.watermark ? (
                  <span className="font-display text-[10px] uppercase tracking-wide text-sun">Free</span>
                ) : (
                  <span className="font-display text-[10px] uppercase tracking-wide text-grass">Pro</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}
