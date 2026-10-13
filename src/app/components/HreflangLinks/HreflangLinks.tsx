/**
 * Renders canonical + hreflang <link> tags directly (React 19 hoists them into <head>).
 *
 * Why not `metadata.alternates`: Next.js strips the trailing "/" from root URLs
 * (e.g. "https://domain/" → "https://domain") and renders the attribute as `hrefLang`.
 * SEO requires root URLs with "/" and a lowercase `hreflang` attribute.
 */
interface Props {
    canonical: string;
    languages: Record<string, string>;
}

export default function HreflangLinks({ canonical, languages }: Props) {
    return (
        <>
            <link rel="canonical" href={canonical} />
            {Object.entries(languages).map(([code, href]) => (
                // Spread keeps the attribute lowercase (`hreflang`) in the rendered HTML
                <link key={code} rel="alternate" {...{ hreflang: code }} href={href} />
            ))}
        </>
    );
}
