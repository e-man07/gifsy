// /guides/best-photos-for-3d-effect — spoke 6 (docs/seo/runs/06): the
// honest-limits page. Every rule is derived from the pipeline (lib/depth.ts
// 518/770 px, ISNet matte, lib/rendering/refine.ts halo band, scene.ts
// ±23° orbit / height-field) and from the 14-photo test in runs/18 (which
// subjects tore, which framed badly, which were clean). No stock claims.

import Link from "next/link";
import { ArticleLayout, H2 } from "@/components/article/ArticleLayout";
import { findArticle } from "@/lib/articles";
import { faqPageNode, type Faq } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

const article = findArticle("guides", "best-photos-for-3d-effect")!;

export const metadata = pageMetadata({
  path: "/guides/best-photos-for-3d-effect",
  title: article.shortTitle!,
  ogTitle: article.title,
  description: article.description,
});

const TOC = [
  { id: "test", title: "The five-second test" },
  { id: "why", title: "Why some photos work: what the models see" },
  { id: "rules", title: "Eleven rules, with the reason for each" },
  { id: "fail", title: "The six photos that fail" },
  { id: "subject", title: "Subject-only scenes: a different checklist" },
  { id: "kinds", title: "By kind of photo" },
  { id: "resolution", title: "Resolution, format and crop" },
  { id: "faq", title: "FAQ" },
];

const FAQ: Faq[] = [
  {
    q: "Does a photo need a blurred background to work?",
    a: "No — and a heavily blurred background is one of the worst inputs. The depth model needs texture to judge distance; a wall of bokeh gives it nothing, so the whole background lands at one depth and the scene looks like a cut-out on a card. Some blur is fine; f/1.4 mush is not.",
  },
  {
    q: "Do portrait-mode photos from a phone work better?",
    a: "Not because of the depth data — Gifsy estimates depth itself and doesn't read the phone's map. Portrait mode helps for the same reason it helps a viewer: one clear subject at a normal distance with a background behind it. The synthetic blur it adds is neutral to slightly harmful.",
  },
  {
    q: "What resolution should the photo be?",
    a: "At least about 640 px on the long edge. Depth is estimated at 518 px (770 px on a capable machine), so a 4K source doesn't add relief — but it does give a sharper subject edge and texture, which is what you see when the scene is large on a page. 1,500–3,000 px is the sweet spot.",
  },
  {
    q: "Can I use an illustration or a 3D render?",
    a: "Yes, and renders are some of the best inputs: clean edges, clear lighting, a subject that stands off its background. Flat illustration works when it has shading or overlapping shapes; a truly flat, outlined drawing has no cues for depth and comes out as a tilting sheet.",
  },
  {
    q: "Why does the edge of my subject look torn or stepped?",
    a: "A hard step in depth inside the subject — an open jacket over a shirt, an ear against hair — means the mesh has to jump between two distances across a single row of pixels. At the orbit extreme that shows. It's much better than it was (the plane now has twice the resolution it had in September 2026), but subjects with big internal depth steps still show it more than smooth ones.",
  },
  {
    q: "Why does my subject get cropped when the scene moves?",
    a: "A 3D photo is a height-field: the depth pushes the subject toward the camera, which magnifies it. The viewer now frames the subject at its pushed distance, so this should not happen on scenes created after 19 September 2026. If it does, lower Depth a little when you create the scene.",
  },
];

export default function BestPhotosGuide() {
  return (
    <ArticleLayout article={article} toc={TOC} extraGraph={[faqPageNode(FAQ)]}>
      <p className="lede">
        A 3D photo is only as good as the photo. The models can estimate depth from anything,
        but they can only find depth that is there to be found: a subject at one distance, a
        background at another, and an edge between them that a matte can follow. Here is what
        that means in practice, with the reason behind each rule, so you can judge a photo
        before you upload it rather than after.
      </p>

      <H2 id="test">The five-second test</H2>
      <p>Look at the photo and answer three questions:</p>
      <ol>
        <li><strong>Could you draw a line around the subject?</strong> If you would hesitate anywhere — hair against a busy background, a hand in front of a table edge, a glass — the matte will hesitate there too.</li>
        <li><strong>Is there something behind the subject that is clearly further away?</strong> Not just &ldquo;a wall&rdquo;: a room, a street, a landscape, a table receding. Depth needs a far and a near.</li>
        <li><strong>Does the subject take up between a fifth and two-thirds of the frame?</strong> Smaller and there is nothing to look at; bigger and there is no background to move against.</li>
      </ol>
      <p>
        Three yeses and it will work. One no and it will still work, but you will see the
        weakness. Two or more and pick another photo.
      </p>

      <H2 id="why">Why some photos work: what the models see</H2>
      <p>
        Two models look at your photo. The depth model (Depth Anything V2, run at 518 px, or 770 px
        on a capable machine) predicts how far away every pixel is, using the same cues you do:
        relative size, what overlaps what, perspective lines, texture getting finer with distance,
        haze. The matte model (ISNet, at 1024 px) decides which pixels are the subject. Gifsy then
        uses the matte to sharpen the depth at the subject&apos;s outline, paints in the background
        behind the subject, and builds two displaced planes the viewer can orbit by about ±23°.
      </p>
      <p>
        Every rule below is one of those steps needing something from the photo. When a photo
        fails, it is always one of: the depth model had no cues, the matte had no edge, or the
        orbit had to show something the photo never contained.
      </p>

      <H2 id="rules">Eleven rules, with the reason for each</H2>
      <ol>
        <li><strong>One subject.</strong> The matte picks the most salient thing. Two people at the same distance is fine (they matte as one); a person and a dog at different distances means one of them lands at the wrong depth.</li>
        <li><strong>Subject one to three metres from the camera, background further.</strong> This is the range where relative size and overlap are strong cues and the background is still readable. A subject at 20 m is a flat scene.</li>
        <li><strong>A background with structure.</strong> A street, shelves, trees, a room. The depth model needs texture that gets smaller with distance; a plain wall or seamless paper gives it one depth for everything behind the subject.</li>
        <li><strong>The subject doesn&apos;t touch the frame edge — or if it does, it is cut off cleanly.</strong> Where the subject leaves the frame, the orbit has to invent what is beyond it; a shoulder cut by the edge stretches. A waist-up crop is fine because the bottom edge is a hard cut; a hand poking out of the side is not.</li>
        <li><strong>Contrast at the outline.</strong> Dark hair on a dark doorway, a white dog on snow, a grey jacket on a grey wall: the matte sees one thing. Light-on-dark or dark-on-light along the whole outline is what you want.</li>
        <li><strong>Hair that reads as a shape.</strong> Tied back, short, or fly-away against a plain area. Fine strands across a busy background become a soft halo.</li>
        <li><strong>Sharp subject.</strong> Motion blur on the subject smears the edge and confuses the depth. Blur in the background is neutral in moderation, harmful when total (see rule 3).</li>
        <li><strong>Even light on the subject.</strong> A hard shadow across a face makes two tones the matte may split. Soft window light, overcast, or a studio softbox are ideal.</li>
        <li><strong>No transparent or reflective subject.</strong> Glass, water, chrome, sunglasses: the matte can&apos;t decide where the object ends and the reflection begins, and the depth model reads the reflection&apos;s depth, not the surface&apos;s.</li>
        <li><strong>No strong internal depth steps.</strong> An open jacket over a shirt, an arm held out toward the camera, a bag strap crossing the body. Each is a hard jump in depth inside the subject, and at the orbit extreme the mesh has to stretch across it. Smooth, rounded forms — a face, a bottle, a sneaker, a rounded character — orbit cleanest.</li>
        <li><strong>Between 640 px and 3,000 px on the long edge.</strong> Under 640 the depth pass has nothing to work with; over 3,000 costs upload time and adds only edge sharpness.</li>
      </ol>

      <H2 id="fail">The six photos that fail</H2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>What you see</th>
              <th>Why</th>
              <th>Fix</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Subject fills the frame</td><td>A tilting photo, no parallax</td><td>No background to move against; the whole image is one depth</td><td>Step back, or crop wider from the original</td></tr>
            <tr><td>Flat wall or seamless behind</td><td>Cut-out on a card</td><td>Depth model finds one distance for everything behind the subject</td><td>Use the subject-only mode (see below) — it&apos;s what that mode is for</td></tr>
            <tr><td>Glass, chrome, water</td><td>Holes and ghosts at the edges</td><td>Matte can&apos;t separate object from reflection</td><td>Pick a different product shot; matte bottles and boxes work</td></tr>
            <tr><td>A crowd, or overlapping people</td><td>People fused together at one depth</td><td>The matte returns one blob; depth can&apos;t separate overlapping bodies</td><td>One or two people, or a clear front row</td></tr>
            <tr><td>Fog, haze, low contrast</td><td>Mush, no relief</td><td>Depth cues are gone; the model guesses</td><td>Any photo with contrast</td></tr>
            <tr><td>Heavy motion blur</td><td>Smeared outline, floating pieces</td><td>The edge the matte needs doesn&apos;t exist</td><td>A sharp frame from the same shoot</td></tr>
          </tbody>
        </table>
      </div>

      <H2 id="subject">Subject-only scenes: a different checklist</H2>
      <p>
        Subject-only mode drops the background and renders the cut-out alone on transparency,
        so it can sit on a page&apos;s own colour. Half the rules above stop mattering — there is
        no background to have structure — and two become everything:
      </p>
      <ul>
        <li><strong>The outline.</strong> It is the whole image now. Any halo, any hair fuzz, any hole is visible against a clean page. Photos on a plain, contrasting background are best here (the opposite of the full-scene advice), because the matte is at its most confident.</li>
        <li><strong>The internal depth.</strong> With no background, the only motion is the subject&apos;s own relief. Rounded subjects — faces, bottles, sneakers, toys, rendered characters — read as solid objects. Flat subjects (a poster, a book cover) barely move.</li>
      </ul>
      <p>
        This is why product shots and character renders on seamless backgrounds, which are poor
        full scenes, make the best subject-only scenes. Choose the mode for the photo you have.
      </p>

      <H2 id="kinds">By kind of photo</H2>
      <ul>
        <li><strong>Portraits.</strong> The best everyday input. Waist-up, subject two metres from a room or street, hair tidy. Avoid glasses with strong reflections.</li>
        <li><strong>Product shots.</strong> On a surface with something behind (a shelf, a wall with depth) for a full scene; on seamless for subject-only. Matte materials over glossy; boxes, shoes, bags, bottles that aren&apos;t clear.</li>
        <li><strong>Travel and landscapes.</strong> Need a foreground: a person, a rock, a railing, a tree. A view with nothing near the camera has no parallax to show. Layered scenes (foreground, mid, far) are the most dramatic of all.</li>
        <li><strong>3D renders and toys.</strong> Excellent. Clean edges, controlled light, obvious volume. This is the kind of image that carries the demo sites in the platform guides.</li>
        <li><strong>Illustration.</strong> Works with shading and overlap; fails when flat and outlined. Painterly digital art with a lit subject on a receding scene is great.</li>
        <li><strong>Pets.</strong> Fur is fine at the outline if the background contrasts; a black cat on a black sofa is not. Sitting or lying beats mid-run.</li>
        <li><strong>Food.</strong> A plate or bowl three-quarters on, with the table receding, is a strong scene. Top-down flat lays have no depth to find.</li>
      </ul>

      <H2 id="resolution">Resolution, format and crop</H2>
      <p>
        JPEG, PNG and WebP all work. Anything from a modern phone is more than enough. If you
        crop first, crop so the subject still has room: the framing rules above are about what
        is in the frame, not the pixel count. Crop away a hand at the edge rather than keeping
        it. Keep the original aspect; the viewer frames a subject-only scene to the subject
        anyway, and a full scene fills whatever box you give it.
      </p>
      <p>
        Then just try it — a generation is quick, and the workshop shows the depth and the matte
        so you can see which rule a photo broke. For what happens next,{" "}
        <Link href="/guides/how-3d-photos-work">how 3D photos work</Link> walks through every
        step; for putting the result on a site, start at the{" "}
        <Link href="/guides/interactive-3d-photos-for-websites">complete guide</Link>.
      </p>

      <H2 id="faq">FAQ</H2>
      {FAQ.map((f) => (
        <div key={f.q}>
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}

      <hr />
      <p>
        <Link href="/create">Try a photo now</Link>. Related:{" "}
        <Link href="/guides/how-3d-photos-work">how 3D photos work</Link>,{" "}
        <Link href="/guides/3d-photo-portfolio">3D photos in a portfolio</Link>, and{" "}
        <Link href="/guides/3d-hero-image">a 3D hero image</Link>.
      </p>
    </ArticleLayout>
  );
}
