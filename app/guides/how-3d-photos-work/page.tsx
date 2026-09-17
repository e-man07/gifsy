// /guides/how-3d-photos-work — the explainer and E-E-A-T anchor of the guides
// cluster (docs/seo/runs/13). Every number below is read from the pipeline
// code: lib/depth.ts (518/770, 14-px patches, 0.5/99.5 percentile),
// lib/depth-split (encoder/head split), lib/rendering/refine.ts (guided
// filter, halo band, SUBJECT_FORWARD 0.06, DEPTH_CONTRAST 0.35),
// lib/rendering/scene.ts (150-segment planes, contact shadow, cover-fit
// camera, ±23°/±13° orbit), lib/inpaint/lama.ts (LaMa at 512, publish-only).
// The screenshots the brief calls for (depth map, matte, backdrop, orbit
// extreme) need a founder-owned photo and are not on the page yet.

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { faqPageNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("guides", "how-3d-photos-work")!;

export const metadata = pageMetadata({
  path: "/guides/how-3d-photos-work",
  title: article.shortTitle!,
  ogTitle: article.title,
  description: article.description,
});

const TOC = [
  { id: "pipeline", title: "The pipeline in one line" },
  { id: "depth", title: "Step 1 — The depth map" },
  { id: "matte", title: "Step 2 — The subject matte" },
  { id: "backdrop", title: "Step 3 — The backdrop" },
  { id: "planes", title: "Step 4 — Two planes, not a mesh" },
  { id: "orbit", title: "Step 5 — The orbit, and why it stops at 23°" },
  { id: "limits", title: "What 3D photos can't do" },
  { id: "kinds", title: "3D photo vs model vs video vs spatial" },
  { id: "data", title: "What leaves your browser" },
  { id: "faq", title: "FAQ" },
];

const FAQ: Faq[] = [
  {
    q: "Do I need a portrait-mode or dual-camera photo?",
    a: "No. Monocular depth estimation predicts depth from one ordinary JPEG. Facebook's 2018 3D Photos needed a dual-camera depth map; today's models such as Depth Anything V2 don't. Portrait-mode depth isn't used even if the file carries it.",
  },
  {
    q: "Is a 3D photo a real 3D model?",
    a: "No. It is a height-field — one surface with depth pushed into it — plus a separate subject layer. There is no back and no sides, so it can't rotate 360°. A 3D model (GLB) has real geometry all the way round.",
  },
  {
    q: "What is a depth map?",
    a: "A greyscale image in which each pixel's brightness is its estimated distance from the camera. On Gifsy brighter means closer; other tools flip it, and there is no universal standard. It is relative depth — near versus far — not metres.",
  },
  {
    q: "Why do the edges look stretched or smeared?",
    a: "Because a single-image scene is a height-field: when the camera goes too far round, the silhouette has to cover surfaces the photo never saw. That is why the orbit is capped at about ±23°, and why frame-filling subjects and subjects cut off by the frame edge look worst.",
  },
  {
    q: "How is this different from Facebook 3D photos or iPhone Spatial Scenes?",
    a: "Same idea — separate the subject, estimate depth, move the layers with the viewer — but those live inside one app. An interactive 2.5D photo is a web element you can embed anywhere, and on Gifsy it's a live scene rather than a rendered video.",
  },
  {
    q: "Does the 3D photo run AI while people look at it?",
    a: "No. The models run once when the scene is created. A published scene ships an image, a depth map, a mask and a backdrop, and draws them with WebGL — it loads in seconds and runs at 60 fps.",
  },
  {
    q: "Is my photo uploaded to make it 3D?",
    a: "The photo stays in the browser. On Free, the depth model's intermediate activations — not the photo — go to the server for the second half of the model; on Pro both halves run locally. Publishing uploads the finished scene and makes it public.",
  },
  {
    q: "What photo resolution do I need?",
    a: "At least about 640 px on the long edge; below that the depth pass has little detail and the result is soft. The model works at 518 px (770 px on capable devices), so a 4K source doesn't add depth detail — but it does give a crisper subject matte and texture.",
  },
];

export default function HowItWorksGuide() {
  return (
    <ArticleLayout article={article} toc={TOC} extraGraph={[faqPageNode(FAQ)]}>
      <p className="lede">
        A 3D photo is a single 2D image that moves as if it had depth. Software estimates how far
        every pixel is from the camera (a depth map), separates the subject from the background,
        fills in what the subject was hiding, then shifts the layers by different amounts as you
        move — parallax — so your eyes read depth.
      </p>
      <p>
        &ldquo;3D photo&rdquo; means three different things: a stereo pair with one image per eye,
        the phone features Facebook and Apple ship, and the depth-parallax scene this article is
        about — which is what Facebook 3D Photos, iOS Spatial Scenes and Gifsy all do underneath.
        Everything below is the exact pipeline Gifsy runs, with the models named and the numbers
        as they are in the code. If you want to put one on a page, start with the{" "}
        <Link href="/guides/embed-3d-photo-on-website">embed guide</Link>.
      </p>

      <div className="not-prose my-8 overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "16 / 10" }}>
        <iframe
          src="/embed/03ed4c7605"
          title="Interactive 3D photo — drag to orbit"
          loading="lazy"
          className="h-full w-full border-0"
        />
      </div>
      <p className="note">
        Drag the scene above. The viewer is drawing an image, a depth map, a mask and a backdrop —
        no AI is running in your browser right now.
      </p>

      <H2 id="pipeline">The pipeline in one line</H2>
      <ol>
        <li>Estimate a <strong>depth map</strong> from the photo.</li>
        <li>Cut a <strong>subject matte</strong> — which pixels are the thing in front.</li>
        <li>Refine the depth with the matte so edges snap to the picture and the halo goes.</li>
        <li>Paint a <strong>backdrop</strong> with the subject removed, so moving it reveals scenery rather than a smear.</li>
        <li>Render <strong>two displaced planes</strong> — backdrop and subject — plus a contact shadow, in WebGL.</li>
        <li>Move the <strong>camera</strong> with the pointer or a drag, inside a cone the photo can honestly support.</li>
      </ol>

      <H2 id="depth">Step 1 — The depth map: how software guesses distance from one photo</H2>
      <p>
        Monocular depth estimation is a neural network that looks at a single image and predicts,
        for every pixel, how far away it is. It learned the cues a person uses — size, occlusion,
        perspective, texture gradient, haze — from millions of images with known depth. The output
        is <em>relative</em> depth: near versus far, not metres.
      </p>
      <p>
        Gifsy runs <strong>Depth Anything V2 Small</strong> (24.8 M parameters, Apache-2.0, the only V2
        size under a permissive licence) as an fp16 ONNX model in the browser. It is a vision
        transformer with 14-pixel patches, so the photo is resized to a long edge of 518 px — or
        770 px on a machine with 8 GB and 8 cores or more, because the later edge refine has more
        real detail to work with — with both sides rounded to a multiple of 14. The raw output is
        normalised to 0–1 using the 0.5th and 99.5th percentiles rather than the true min and max,
        so a few outlier pixels can&apos;t flatten the whole map. On Gifsy, brighter means closer.
      </p>
      <p>
        The network is split in two. Your browser always runs the encoder — 44 MB, cached after
        the first run. The small head that turns the encoder&apos;s output into depth runs on your
        device on Pro, and on our server on Free, where it receives the encoder&apos;s activations
        rather than the photo.
      </p>

      <H2 id="matte">Step 2 — The subject matte: deciding what&apos;s in front</H2>
      <p>
        A depth map alone tilts like a sheet. What makes a scene read as 3D is a subject moving
        against its background, so a second model, <strong>ISNet</strong> (from the DIS segmentation
        work, via the open-source <code>@imgly/background-removal</code> library), produces a per-pixel
        alpha of the subject — entirely in the browser.
      </p>
      <p>
        The raw alpha is cleaned: values below about 9% are dropped as fringe, islands smaller
        than 5% of the main region are erased (a crumb, a blade of grass), and the edge gets a
        one-pixel feather. The matte stays full-frame and registered to the image and the depth
        map — never cropped — because the layers must line up. If ISNet finds nothing to isolate,
        the scene falls back to a single displaced plane; the app says so: &ldquo;Depth-only view —
        segmentation couldn&apos;t separate a subject.&rdquo; That is the honest reason some photos
        look flat.
      </p>
      <h3>Why the raw depth map has a halo, and how the matte fixes it</h3>
      <p>
        Depth models bleed a soft halo of &ldquo;near&rdquo; into the background pixels hugging a
        subject, which renders as a fuzzy cardboard cut-out. Gifsy refines the map in three
        passes, all on the CPU, once per generation. A <strong>guided filter</strong> uses the photo&apos;s
        own luminance as its guide, so depth edges snap onto real image edges (radius 2% of the
        short side, clamped to 3–16 px). Then the subject plus a contamination band around it is
        marked unknown and the background depth is extrapolated inward through that band with a
        push-pull pyramid; the subject&apos;s own relief is kept inside the alpha and lifted forward
        by a fixed 0.06 so it always leads the backdrop. Finally a smootherstep{" "}
        <strong>contrast curve</strong> (strength 0.35) steepens the mid-range, where real photos
        bunch their depth, so near, mid and far separate without more displacement — displacement
        is what causes artefacts.
      </p>

      <H2 id="backdrop">Step 3 — The backdrop: painting the subject out</H2>
      <p>
        When the subject slides, the pixels it used to cover become visible — disocclusion.
        Without a fill you see a smeared ghost of the subject where it used to be. In the live
        preview, Gifsy fills the hole with a push-pull blur from the surrounding background,
        which is fast but leaves a flat smear in the gap parallax opens beside the subject —
        worst on landscapes. At publish, once, on the server, <strong>LaMa</strong>
        (&ldquo;large mask inpainting&rdquo;, with Fourier convolutions) paints the subject out
        properly at a fixed 512×512, letterboxed to keep the aspect ratio, and the fill is
        mapped back to full resolution and baked into the scene as its own file. The viewer never
        runs it.
      </p>

      <H2 id="planes">Step 4 — Two planes, not a mesh</H2>
      <p>
        The scene is two <strong>plane meshes of 150×150 segments</strong> in Three.js. The backdrop
        plane carries the inpainted fill, overscanned by 8% so a slide never reveals a gutter. The
        subject plane carries the photo multiplied by the matte&apos;s alpha. Each vertex is pushed
        toward the camera by the refined depth in a custom shader. A third, thin mesh is the
        contact shadow: a soft black copy of the silhouette just in front of the backdrop that lags
        the subject, so a gap opens under it as it moves — the strongest floating cue there is.
      </p>
      <p>
        <strong>Why not a mesh?</strong> One photo contains no hidden surfaces. Build a mesh from a
        single depth map and every silhouette becomes a torn skirt of stretched triangles;
        Facebook&apos;s 2018 3D Photos hit exactly this and had a neural network hallucinate the gaps.
        A mesh you can spin all the way round is a different product — see{" "}
        <Link href="/alternatives/immersity-ai">how the tools compare</Link>.{" "}
        <strong>Why not one plane?</strong> Depth without separation reads as a sheet tilting, not a
        subject standing in front of a background. And a single shifted plane stretches the texture
        into a horizontal smear at the depth step; Gifsy slides the subject plane almost rigidly
        (15% internal relief) so its feathered edge translates instead of stretching.
      </p>
      <p>
        The camera is placed at exactly the distance that makes the plane cover the viewport,
        with 8% bleed at rest to hide the sway, easing in slightly on hover. Cut-out scenes use a
        contain fit instead so feet and edges aren&apos;t cropped.
      </p>

      <H2 id="orbit">Step 5 — The orbit, and why it stops at 23°</H2>
      <p>
        Two motion modes. <strong>Hover parallax:</strong> the pointer position becomes a depth-weighted
        offset, with the subject responding about three times as strongly as the backdrop (0.34
        versus 0.10) around a pivot depth of 0.4. <strong>Spin:</strong> a drag steers a real camera arc
        around the displaced relief — actual perspective and self-occlusion, not a shader slide.
      </p>
      <p>
        The arc is capped at <strong>±0.40 radians (about 23°) sideways and ±0.22 (about 13°)
        vertically</strong>. A single-image depth map is a one-sided height-field, a bas-relief: it
        has no back and no sides, so past a shallow cone the stretched silhouette edges smear. We
        set the cone from frames, not taste — at ±32°/±19° a frame-filling cartoon smeared its
        outer third, so the limit came in until a held drag stayed inside the honest zone. One
        more number learned the hard way: the camera radius is 0.85× the cover distance, because
        a plane tilted to the corner of the cone foreshortens to about 0.896 of its width and at
        0.9 the viewport saw past the plane&apos;s corner at every extreme.
      </p>

      <H2 id="limits">What 3D photos can&apos;t do</H2>
      <ul>
        <li>Show a back or sides — it is a height-field, so no 360°.</li>
        <li>Orbit past about ±23° sideways or ±13° up and down without the silhouette stretching.</li>
        <li>Handle frame-filling subjects: nothing behind them to parallax against, so the edges tear on the first drag. A subject cut off by the frame edge has no matte there at all.</li>
        <li>Separate a subject from a busy or low-contrast background — the matte and the inpainter both struggle, and the scene falls back to depth-only.</li>
        <li>Do much with fewer than about 640 px on the long edge; the app warns below that.</li>
        <li>Cope well with hair, glass, water, motion blur and low light — Meta&apos;s 2019 list of hard cases still holds.</li>
      </ul>

      <H2 id="kinds">3D photo vs 3D model vs 3D video vs spatial photo</H2>
      <div className="table-wrap wide">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Stereo / anaglyph</th>
              <th>Facebook 3D Photo</th>
              <th>Apple Spatial Photo</th>
              <th>iOS Spatial Scene</th>
              <th>3D model (GLB)</th>
              <th>3D photo video (MP4)</th>
              <th>Interactive 2.5D (this page)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Input</td><td>Two photos</td><td>Dual-camera portrait, later single</td><td>Two lenses</td><td>One photo</td><td>Scans or a generator</td><td>One photo</td><td>One photo</td></tr>
            <tr><td>Depth source</td><td>Your eyes</td><td>Stereo depth</td><td>Stereo pair</td><td>AI depth map</td><td>Real geometry</td><td>AI depth map</td><td>AI depth map + matte</td></tr>
            <tr><td>Hidden areas</td><td>n/a</td><td>Hallucinated by a CNN</td><td>n/a</td><td>Generated</td><td>Modelled</td><td>Inpainted, baked into video</td><td>Inpainted once, baked into the scene</td></tr>
            <tr><td>Viewable range</td><td>Fixed</td><td>Small parallax in feed</td><td>Vision Pro</td><td>Tilt the phone</td><td>Full 360°</td><td>Whatever was rendered</td><td>±23° / ±13°, live</td></tr>
            <tr><td>Interactive on a web page</td><td>No</td><td>No (retired)</td><td>No</td><td>No</td><td>Yes, heavy viewer</td><td>No — it&apos;s a video</td><td>Yes, one iframe, no AI at view time</td></tr>
            <tr><td>Belongs in</td><td>Prints, VR</td><td>Nostalgia</td><td>Vision Pro library</td><td>Lock screen</td><td>Product, AR</td><td>Reels, TikTok</td><td>Website hero, portfolio</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Video wins where a page can&apos;t run an iframe — social feeds, email. Most 3D photo tools
        export an MP4; <Link href="/alternatives/immersity-ai">the comparison</Link> sorts them by
        that. For the interactive row, the <Link href="/guides/embed-3d-photo-on-website">embed guide</Link>.
      </p>

      <H2 id="data">What leaves your browser (and what doesn&apos;t)</H2>
      <p>
        Your photo stays in the browser. On the free plan, the depth model is split in two: your
        browser runs the first half on the photo, and the intermediate activations it produces —
        not the photo — are sent to our server for the second half, then the depth map comes back.
        On Pro, both halves run on your device and the depth step is fully local. When you
        publish, the finished scene — the processed image, its depth map, the subject mask and
        the generated backdrop — is uploaded so it can be embedded, and at that point your image
        and mask are also sent once to the inpainting step. Published scenes are public. The full
        account is the <Link href="/privacy">privacy policy</Link>.
      </p>

      <H2 id="faq">Frequently asked questions</H2>
      {FAQ.map((f) => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}

      <hr />
      <p>
        <Link href="/create">Make a 3D photo from your own image</Link> — the viewer needs no AI, so
        the scene at the top of this page is exactly what your visitors would get.
      </p>
      <p className="note">
        Sources: Depth Anything V2 (arXiv 2406.09414; github.com/DepthAnything/Depth-Anything-V2);
        ISNet / DIS (arXiv 2203.03041; github.com/xuebinqin/DIS); LaMa (arXiv 2109.07161;
        github.com/advimman/lama; the Carve/LaMa-ONNX export); He, Sun &amp; Tang, &ldquo;Guided
        Image Filtering&rdquo;; Three.js; onnxruntime-web. Prior art: Alan Zucconi&apos;s
        &ldquo;Inside Facebook 3D Photos&rdquo; and Meta&apos;s 2019 &ldquo;3D photos: how they work&rdquo;.
      </p>
    </ArticleLayout>
  );
}
