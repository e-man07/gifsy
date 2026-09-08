import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import {
  CONTACT_EMAIL,
  COMPANY_NAME,
  GOVERNING_LAW,
  LIFETIME_MEANING,
  REFUND_WINDOW_DAYS,
} from "@/lib/legal";
import { FREE_GENERATION_LIMIT, PLAN_DISPLAY } from "@/lib/billing/plans";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The terms for using Gifsy: your content stays yours, what Free and one-time Pro each allow, and the limits of the service.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="What you can expect from Gifsy, and what we expect from you. Plain language, no traps."
    >
      <h2>What Gifsy is</h2>
      <p>
        {COMPANY_NAME} turns a photo into an animated GIF, a cut-out sticker, or
        an interactive 3D scene. GIFs and stickers run entirely in your browser.
        3D depth runs in your browser on Pro; on Free, one step of it runs on
        our server (see the{" "}
        <Link href="/privacy">privacy policy</Link>). Published 3D
        scenes are hosted by us and given a shareable link and an embed code. By
        using {COMPANY_NAME}, you agree to these terms.
      </p>

      <h2>Your account</h2>
      <p>
        You can create GIFs and stickers without an account, and there is no
        limit on them. A free account is required to generate a 3D scene, so
        that generations can be counted against your allowance, and to publish
        anything. You are responsible for what happens under your account and
        for keeping access to your email secure.
      </p>

      <h2>Your content stays yours</h2>
      <p>
        You keep all rights to the photos you use and the scenes you make. You
        grant us only the permission we need to run the service: to store,
        process and publicly serve a scene you choose to publish, so that its
        share link and embed work. That permission ends when the scene is
        deleted.
      </p>
      <p>
        You confirm that you have the right to use any photo you upload or
        publish, and that doing so does not infringe anyone else&apos;s rights.
      </p>

      <h2>What Free and Pro allow</h2>
      <ul>
        <li>
          <strong>Free</strong> — unlimited GIFs and stickers with no account,
          and {FREE_GENERATION_LIMIT} free 3D generations (an account is needed
          for 3D). Publishing those scenes is unlimited, and published scenes
          carry a &ldquo;Made with Gifsy&rdquo; badge. Free is for personal and
          non-commercial use.
        </li>
        <li>
          <strong>Pro</strong> — a single {PLAN_DISPLAY.pro.price} payment for
          unlimited 3D generations, no badge, 3D that runs entirely on your own
          device, and a licence to use your scenes commercially, including on
          client work and on sites that make money.
        </li>
      </ul>
      <p>
        <strong>Pro is bought once.</strong> There is no subscription, no
        renewal and nothing to cancel, and your access does not expire. To be
        plain about the word &ldquo;lifetime&rdquo;: it means{" "}
        {LIFETIME_MEANING}, not a guarantee that the service will exist forever.
        You can have the payment back within {REFUND_WINDOW_DAYS} days for any
        reason — see <Link href="/refund">Refunds</Link>, which also covers what
        a refund does to your account.
      </p>
      <p>
        3D generations are counted per account. Free accounts get{" "}
        {FREE_GENERATION_LIMIT}; the count is kept on our servers and is not
        reset by clearing your browser data.
      </p>
      <p>
        Removing, hiding or obscuring the Gifsy badge on a Free scene — in CSS,
        in the embedding page, or otherwise — is not permitted. If you need the
        badge gone, that is what Pro is for. See{" "}
        <Link href="/pricing">Pricing</Link>.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          publish content that is illegal, infringing, hateful, or sexual
          content involving minors;
        </li>
        <li>
          publish someone&apos;s image or personal photographs without their
          permission;
        </li>
        <li>
          use our APIs in an automated way, or in a way designed to place
          disproportionate load on the service;
        </li>
        <li>
          attempt to bypass plan limits — including tampering with the app to
          avoid the 3D generation count, or extracting or redistributing the
          model files we serve you — or resell {COMPANY_NAME} as your own
          product.
        </li>
      </ul>
      <p>
        We may remove content or suspend an account that breaks these rules.
        Where it is reasonable to do so, we will tell you why.
      </p>

      <h2>Availability</h2>
      <p>
        We work to keep {COMPANY_NAME} and published embeds available, but we do
        not promise uninterrupted service. Features may change, and we may
        discontinue parts of the service.
      </p>
      <p>
        Because Pro is a one-time payment rather than a subscription, there is
        no period to pro-rate. If we shut down {COMPANY_NAME} or remove Pro
        features you paid for, we will give you reasonable notice, and if you
        bought Pro within the twelve months before that notice we will refund
        you in full on request.
      </p>

      <h2>No warranty, and limits on liability</h2>
      <p>
        {COMPANY_NAME} is provided &ldquo;as is&rdquo;, without warranties of
        any kind. To the fullest extent the law allows, we are not liable for
        indirect or consequential losses, lost profits, or lost data. Where
        liability cannot be excluded, it is limited to the total amount you have
        paid us — for a one-time purchase that is the price you paid, whenever
        you paid it, and it does not shrink over time.
      </p>
      <p>
        You are responsible for keeping your own copies of anything important to
        you.
      </p>

      <h2>Ending things</h2>
      <p>
        You can stop using {COMPANY_NAME} at any time. There is no paid plan to
        cancel — Pro is a single payment — and if you want that payment back,
        see <Link href="/refund">Refunds</Link>. We may suspend or close an
        account that breaks these terms. On closure, published scenes may be
        removed and their links and embeds will stop working.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The date at the top of this page shows the
        current version, and continuing to use {COMPANY_NAME} after a change
        means you accept it.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of {GOVERNING_LAW}, and its courts
        have exclusive jurisdiction over any dispute.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
