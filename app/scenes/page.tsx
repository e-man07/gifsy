// "My scenes" — a signed-in creator's published 2.5D scenes, read from Postgres
// (RLS-scoped to the owner). Auth-gated: redirects to /login when signed out.

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My scenes · Gifsy" };

interface SceneRow {
  id: string;
  image_url: string | null;
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
    .select("id,image_url,created_at,watermark")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  const scenes = (data ?? []) as SceneRow[];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-pixel text-xs uppercase tracking-[0.2em] text-sky">Your account</p>
          <h1 className="mt-1 font-pixel text-3xl text-foreground">My scenes</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/pricing" className="btn-pixel rounded-xl bg-panel px-4 py-2 font-pixel text-sm text-foreground">
            Plans
          </Link>
          <Link href="/" className="btn-pixel rounded-xl bg-sky px-4 py-2 font-pixel text-sm text-cloud">
            New scene
          </Link>
        </div>
      </div>

      {scenes.length === 0 ? (
        <div className="hud mt-8 rounded-2xl bg-panel p-10 text-center">
          <p className="font-pixel text-lg text-foreground">No published scenes yet</p>
          <p className="mt-2 text-sm text-muted">
            Make a 3D scene and hit Publish — it&apos;ll show up here with a shareable link and embed code.
          </p>
          <Link href="/" className="btn-pixel mt-5 inline-block rounded-xl bg-grass px-5 py-2.5 font-pixel text-sm text-ink">
            Create one
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {scenes.map((s) => (
            <Link
              key={s.id}
              href={`/s/${s.id}`}
              className="hud group overflow-hidden rounded-xl bg-panel transition hover:-translate-y-0.5"
            >
              <div className="aspect-square w-full overflow-hidden bg-background">
                {s.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.image_url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="font-pixel text-[11px] uppercase tracking-wide text-muted">
                  {new Date(s.created_at).toLocaleDateString()}
                </span>
                {s.watermark ? (
                  <span className="font-pixel text-[10px] uppercase tracking-wide text-sun">Free</span>
                ) : (
                  <span className="font-pixel text-[10px] uppercase tracking-wide text-grass">Pro</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
