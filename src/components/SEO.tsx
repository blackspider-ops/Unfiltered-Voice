import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    author?: string;
    category?: string;
}

const BASE_URL = 'https://www.unfilteredvoice.me';

export function SEO({
    title = 'The Unfiltered Voice - Raw thoughts, real voices',
    description = 'Where thoughts are raw, feelings are loud, and words don\'t wear filters. An editorial blog by Niyati Singhal.',
    image = `${BASE_URL}/favicon.png`,
    url = BASE_URL,
    type = 'website',
    publishedTime,
    author = 'Niyati Singhal',
    category
}: SEOProps) {
    const fullTitle = title.includes('Unfiltered Voice') ? title : `${title} | The Unfiltered Voice`;

    const structuredData = type === 'article' ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': title,
        'description': description,
        'image': image,
        'url': url,
        'datePublished': publishedTime,
        'author': {
            '@type': 'Person',
            'name': author,
            'url': `${BASE_URL}/meet-niyati`
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'The Unfiltered Voice',
            'logo': {
                '@type': 'ImageObject',
                'url': `${BASE_URL}/favicon.png`
            }
        },
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': url
        },
        ...(category && { 'articleSection': category })
    } : {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'The Unfiltered Voice',
        'description': description,
        'url': BASE_URL,
        'author': {
            '@type': 'Person',
            'name': 'Niyati Singhal'
        },
        'potentialAction': {
            '@type': 'SearchAction',
            'target': `${BASE_URL}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
        }
    };

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="The Unfiltered Voice" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Article specific */}
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {author && <meta property="article:author" content={author} />}
            {category && <meta property="article:section" content={category} />}

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
}
