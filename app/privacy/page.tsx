import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, COMPANY_NAME } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Gifsy does and doesn't collect: GIFs and stickers stay on your device, 3D depth involves our server on the free plan, publishing uploads the finished scene.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="The short version: your photo itself never leaves your device. GIFs and stickers are processed entirely by your browser. Making a 3D scene on the free plan sends intermediate data — not the photo — to our server for one step. Publishing uploads the finished files. This page explains each case exactly."
    >
      <h2>What runs where, plainly</h2>
      <p>
        <strong>GIFs and stickers are entirely local.</strong> When you drop in a
        photo to make a GIF or a sticker, the image is processed by your own
        browser. The AI models run on your device. The photo is not sent to us,
        we cannot see it, and no account is required.
      </p>
      <p>
        <strong>3D is local on Pro, and split on Free.</strong> See the next
        section — this is the one place the two plans genuinely differ in what
        we receive.
      </p>
      <p>
        <strong>Publishing uploads.</strong> If you choose to publish a 3D scene
        so it has a shareable link and an embed, the finished files are uploaded
        to our storage. Nothing is uploaded until you press Publish.
      </p>

      <h2>How 3D depth is calculated</h2>
      <p>
        Making a 3D scene needs a depth map. The model that produces it is
        split in two halves, and which half runs where depends on your plan.
      </p>
      <ul>
        <li>
          <strong>Free.</strong> Your browser runs the first and larger half of
          the model on your photo. The result is a set of intermediate numbers
          (machine-learning &ldquo;activations&rdquo;) which are sent to our
          server, where the second half turns them into a depth map that is
          sent back. <strong>Your photo is never sent</strong> — only these
          intermediate numbers, which are not an image and cannot be viewed as
          one. We process them in memory to produce your depth map and do not
          store or log them. We do record that a generation happened, so we can
          count it against your free allowance.
        </li>
        <li>
          <strong>Pro.</strong> You receive both halves of the model and
          everything runs on your device, exactly like GIFs and stickers. No
          image data and no intermediate data reaches us at all, and it works
          offline.
        </li>
      </ul>
      <p>
        We should be straightforward about one caveat: intermediate activations
        are derived from your photo. They are not a picture and we do not attempt
        to reconstruct anything from them, but published research shows that
        approximate reconstruction from data of this kind is possible in
        principle. If that matters for a particular image, use Pro (fully local)
        or stick to GIFs and stickers.
      </p>

      <h2>What we receive when you publish</h2>
      <ul>
        <li>
          The processed colour image, its depth map, the cut-out subject layer,
          and a generated background — the files the viewer needs to draw your
          scene.
        </li>
        <li>
          A database record: the scene&apos;s ID, the account that owns it, your
          chosen scene settings, whether it carries the Gifsy badge, and a view
          counter.
        </li>
      </ul>
      <p>
        <strong>Published scenes are public.</strong> That is the point of them —
        they are made to be shared and embedded on other websites. Their files
        are served from public URLs, so anyone with the link, or with the page
        the scene is embedded in, can view them. They may also be cached by
        browsers and content networks for up to a year. Please do not publish a
        photo you would not put on a public web page.
      </p>

      <h2>The background-cleanup step</h2>
      <p>
        At the moment you publish, your image and its subject mask are sent to
        our server once, so a model can paint in a clean background behind the
        subject. That data is processed in memory to produce the result and is
        not stored or logged by us. Together with the depth step described above
        and the upload of the finished scene, this is the complete list of times
        anything derived from your image leaves your device.
      </p>

      <h2>Accounts</h2>
      <p>
        You do not need an account for GIFs or stickers. You need a free account
        to generate a 3D scene, and to publish. If you sign up, we store your
        email address, your plan, and a count of the 3D generations you have
        made — that last one is how the free allowance is enforced, so it is
        kept on our servers and is not affected by clearing your browser data.
        We do not store the images those generations were made from.
        Authentication is handled by Supabase.
      </p>

      <h2>Payments</h2>
      <p>
        Payments are handled by Dodo Payments, which acts as the merchant of
        record. Your card details go to them, never to us — we never see or
        store them. Pro is a single payment with no subscription and no renewal
        date, so what we keep is a record of that payment and the plan it
        granted, which is how we know to give you Pro.
      </p>

      <h2>Analytics</h2>
      <p>
        We use Vercel Analytics to count page views and a small number of
        product events — for example that a scene was published, or that a
        visitor interacted with a demo. It is aggregate and is not used to build
        a profile of you or to track you across other websites.
      </p>

      <h2>Services we rely on</h2>
      <ul>
        <li>
          <strong>Vercel</strong> — hosting, file storage for published scenes,
          and analytics.
        </li>
        <li>
          <strong>Supabase</strong> — accounts and our database.
        </li>
        <li>
          <strong>Dodo Payments</strong> — payments.
        </li>
        <li>
          <strong>jsDelivr and img.ly</strong> — your browser downloads the
          inference runtime and the background-removal model from these content
          networks the first time you use a feature that needs them. They
          receive the request for those files, as any website you load a file
          from would. Your photo is not part of that request. The depth
          model&apos;s two halves come from our own storage, not a third party.
        </li>
      </ul>

      <h2>Keeping and deleting your data</h2>
      <p>
        Published scenes stay up until you or we remove them. Because their
        files are served with long cache lifetimes, copies may persist in caches
        for a period after deletion.
      </p>
      <p>
        <strong>
          Self-serve deletion of a published scene is not available yet.
        </strong>{" "}
        To delete a published scene, or your account and everything attached to
        it, email us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the address
        on your account, and we will action it.
      </p>

      <h2>Children</h2>
      <p>
        {COMPANY_NAME} is not directed at children under 13, and we do not
        knowingly collect their personal information.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes in a way that affects you, we will update the
        date at the top of this page. Continuing to use {COMPANY_NAME} after a
        change means you accept the updated policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, or a deletion request:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also our{" "}
        <Link href="/terms">Terms</Link> and{" "}
        <Link href="/refund">Refund Policy</Link>.
      </p>
    </LegalPage>
  );
}
