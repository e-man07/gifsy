-- Add a thumbnail URL to published scenes.
--
-- The account ("My scenes") and gallery grids render each scene in a ~240px
-- square cell but loaded `image_url` — the full 1440px WebP hero asset — so a
-- grid of 12 scenes pulled roughly an order of magnitude more bytes than the
-- cells could show. Blob Data Transfer is billed on every download, cache HIT
-- included, so that was the single largest avoidable cost in the product.
--
-- Publishing now also uploads a 400px WebP to `scenes/<id>/thumb.webp`; this
-- column records its public URL.
--
-- Nullable on purpose, with no backfill: scenes published before this migration
-- have no thumbnail, and the grids fall back to `image_url` (see
-- app/scenes/page.tsx). Re-publishing a scene fills it in.

alter table public.scenes add column if not exists thumb_url text;
