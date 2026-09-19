// The three things Gifsy makes, as they appear in every header (the Tools
// dropdown on desktop, flat rows in the phone menu). Plain data: both server
// and client components read it.
export const TOOL_LINKS = [
  { href: "/create", label: "3D photo", note: "One photo → a scene you can drag, embed anywhere" },
  { href: "/tools/gif", label: "GIF maker", note: "Animate a photo, in your browser" },
  { href: "/tools/sticker", label: "Telegram stickers", note: "Cut-out, outline, 512×512" },
] as const;
