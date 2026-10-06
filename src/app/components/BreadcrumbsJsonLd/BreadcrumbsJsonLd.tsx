interface BreadcrumbsJsonLdProps {
    data: object;
}

export default function BreadcrumbsJsonLd({ data }: BreadcrumbsJsonLdProps) {
    return (
        <head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(data).replace(/</g, '\\u003c'),
                }}
            />
        </head>
    );
}
