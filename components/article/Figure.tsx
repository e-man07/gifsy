// Screenshot with caption for article pages. Plain <img>: the files are
// pre-sized WebPs under public/guides and next/image would only add a
// wrapper the .article CSS has to fight.
export function Figure({ src, alt, caption, width, height }: { src: string; alt: string; caption: string; width: number; height: number }) {
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
