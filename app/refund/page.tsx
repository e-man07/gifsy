import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo/metadata";
import {
  CONTACT_EMAIL,
  COMPANY_NAME,
  LIFETIME_MEANING,
  REFUND_WINDOW_DAYS,
} from "@/lib/legal";
import { PLAN_DISPLAY } from "@/lib/billing/plans";

export const metadata = pageMetadata({
  path: "/refund",
  title: "Refunds",
  description:
    `Gifsy Pro is a one-time ${PLAN_DISPLAY.pro.price} payment with nothing to cancel, and a no-questions refund within ${REFUND_WINDOW_DAYS} days.`,
});

export default function RefundPage() {
  return (
    <LegalPage
      title="Refunds"
      intro={`Pro is a single ${PLAN_DISPLAY.pro.price} payment — there is no subscription and nothing to cancel. If it isn't what you expected, tell us within ${REFUND_WINDOW_DAYS} days of paying and we'll refund it in full.`}
    >
      <h2>Who takes the payment</h2>
      <p>
        Payments for {COMPANY_NAME} Pro are processed by Dodo Payments, acting
        as merchant of record. They appear on your statement and they issue any
        refund, but you deal with us — email us and we will arrange it.
      </p>

      <h2>There is nothing to cancel</h2>
      <p>
        Pro is bought once. There is no recurring charge, no renewal date, and
        no subscription to cancel — so there is no way to be billed again by
        accident. If you see a second {COMPANY_NAME} charge on your statement,
        that is a mistake and we will refund it; see{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
      <p>
        Your Pro access does not expire. To be straightforward about what
        &ldquo;lifetime&rdquo; means: it lasts {LIFETIME_MEANING}. It is not a
        promise that the service will run forever — see{" "}
        <Link href="/terms">Terms</Link> for what happens if we ever have to
        shut it down.
      </p>

      <h2>The {REFUND_WINDOW_DAYS}-day refund</h2>
      <p>
        <strong>
          Within {REFUND_WINDOW_DAYS} days of your payment, we will refund it in
          full, no questions asked.
        </strong>{" "}
        Just email us. You do not need a reason, and &ldquo;I tried it and it
        isn&apos;t for me&rdquo; is a perfectly good one.
      </p>

      <h2>After the {REFUND_WINDOW_DAYS} days</h2>
      <p>
        There is no ongoing charge to stop, so this is only about the single
        payment you already made. Our normal approach:
      </p>
      <ul>
        <li>
          <strong>Something was broken.</strong> If Pro did not do what it says
          — the badge stayed on your embeds, 3D generation kept failing, the
          model would not run on your device — tell us. If we cannot fix it
          promptly, you get your money back regardless of how long ago you paid.
        </li>
        <li>
          <strong>You were charged twice.</strong> Duplicate or unrecognised
          charges are refunded, always.
        </li>
        <li>
          <strong>You changed your mind much later.</strong> Outside the{" "}
          {REFUND_WINDOW_DAYS} days, and where Pro has worked as described and
          you have been using it, we do not normally refund. Ask anyway — see
          below.
        </li>
      </ul>
      <p>
        We would rather refund someone than have them feel stuck. If your
        situation is not on this list, ask.
      </p>

      <h2>What a refund does to your account</h2>
      <p>
        A refund ends Pro. Your account returns to Free, which means:
      </p>
      <ul>
        <li>
          3D generation goes back to the Free allowance, and generations you
          have already used still count.
        </li>
        <li>
          Newly published scenes carry the &ldquo;Made with Gifsy&rdquo; badge
          again. Scenes you published while on Pro keep working and keep their
          existing badge state.
        </li>
        <li>
          The commercial licence ends. If you have used a scene commercially,
          that use is no longer covered from the date of the refund.
        </li>
        <li>
          3D generation stops running fully on your device and uses our server
          again, within the Free allowance. See{" "}
          <Link href="/privacy">Privacy</Link> for what that involves.
        </li>
      </ul>
      <p>
        Nothing you have already downloaded is taken away — your GIFs, stickers,
        PNGs and WebM files are yours.
      </p>

      <h2>The Free plan</h2>
      <p>
        Free costs nothing, always will, and never asks for a card. There is
        nothing to refund there. GIFs and stickers are unlimited on Free and do
        not need an account at all.
      </p>

      <h2>How to request a refund</h2>
      <p>
        Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the
        address on your account, and say what happened. We aim to reply within
        two business days. Approved refunds are returned to your original
        payment method, and how quickly it appears is up to your bank —
        typically five to ten business days.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. See also our{" "}
        <Link href="/terms">Terms</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
