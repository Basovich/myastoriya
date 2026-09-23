/**
 * Hreflang Audit Script for MyAstoriya
 * Usage: npm run check:hreflang [baseUrl]
 * Example: npm run check:hreflang http://localhost:3000
 */

const BASE_URL = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

console.log(`\n🔍 Starting Hreflang Audit on target: ${BASE_URL}\n`);

async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, options);
            return res;
        } catch (err) {
            if (attempt === retries) throw err;
            await new Promise(resolve => setTimeout(resolve, 300 * attempt));
        }
    }
}

async function fetchXml(url) {
    try {
        const res = await fetchWithRetry(url);
        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    }
}

function extractUrlsFromXml(xmlText) {
    const locRegex = /<loc>(.*?)<\/loc>/g;
    const urls = [];
    let match;
    while ((match = locRegex.exec(xmlText)) !== null) {
        urls.push(match[1].trim());
    }
    return urls;
}

function normalizeUrl(urlStr, targetBaseUrl) {
    try {
        const parsed = new URL(urlStr);
        const baseParsed = new URL(targetBaseUrl);
        parsed.protocol = baseParsed.protocol;
        parsed.host = baseParsed.host;
        return parsed.toString();
    } catch {
        return urlStr;
    }
}

function parseHreflangTags(htmlText) {
    const tagRegex = /<link\s+[^>]*rel=["']alternate["'][^>]*>/gi;
    const hrefRegex = /href=["']([^"']+)["']/i;
    const hreflangRegex = /hreflang=["']([^"']+)["']/i;

    const alternates = [];
    let match;
    while ((match = tagRegex.exec(htmlText)) !== null) {
        const fullTag = match[0];
        const hrefMatch = hrefRegex.exec(fullTag);
        const hreflangMatch = hreflangRegex.exec(fullTag);
        if (hrefMatch && hreflangMatch) {
            alternates.push({
                lang: hreflangMatch[1],
                href: hrefMatch[1],
            });
        }
    }
    return alternates;
}

async function runAudit() {
    // 1. Fetch main sitemap
    const mainSitemapUrl = `${BASE_URL}/sitemap.xml`;
    console.log(`Fetching main sitemap from ${mainSitemapUrl}...`);
    const mainXml = await fetchXml(mainSitemapUrl);

    if (!mainXml) {
        console.error(`❌ Failed to fetch ${mainSitemapUrl}. Make sure server is running!`);
        process.exit(1);
    }

    const subSitemaps = extractUrlsFromXml(mainXml);
    console.log(`Found ${subSitemaps.length} sub-sitemaps.\n`);

    const pageUrls = new Set();

    for (const subSitemap of subSitemaps) {
        const normalizedSubUrl = normalizeUrl(subSitemap, BASE_URL);
        console.log(`Fetching sub-sitemap: ${normalizedSubUrl}...`);
        const subXml = await fetchXml(normalizedSubUrl);
        if (subXml) {
            const extracted = extractUrlsFromXml(subXml);
            extracted.forEach(u => pageUrls.add(normalizeUrl(u, BASE_URL)));
        }
    }

    console.log(`\nCollected ${pageUrls.size} unique page URLs to audit.\n`);

    let passedCount = 0;
    let failedCount = 0;
    let warningCount = 0;
    const errors = [];

    const urlArray = Array.from(pageUrls);

    // Concurrency limit of 5 for speed without hammering server sockets
    const batchSize = 5;

    for (let i = 0; i < urlArray.length; i += batchSize) {
        const batch = urlArray.slice(i, i + batchSize);
        await Promise.all(
            batch.map(async (pageUrl) => {
                try {
                    const res = await fetchWithRetry(pageUrl, { redirect: 'manual' });
                    if (res.status >= 300 && res.status < 400) {
                        const redirectLocation = res.headers.get('location');
                        warningCount++;
                        console.warn(`⚠️ [301 Redirect] ${pageUrl} -> ${redirectLocation}`);
                        return;
                    }
                    if (!res.ok) {
                        failedCount++;
                        errors.push({ pageUrl, issue: `HTTP ${res.status} when fetching main page` });
                        console.error(`❌ [HTTP ${res.status}] ${pageUrl}`);
                        return;
                    }

                    const html = await res.text();
                    const alternates = parseHreflangTags(html);

                    if (alternates.length === 0) {
                        warningCount++;
                        console.warn(`⚠️ [No Hreflang] No hreflang tags found on ${pageUrl}`);
                        return;
                    }

                    // Validate each alternate link
                    let pageValid = true;
                    for (const alt of alternates) {
                        const targetAltUrl = normalizeUrl(alt.href, BASE_URL);
                        try {
                            const altRes = await fetchWithRetry(targetAltUrl, { method: 'HEAD' });
                            if (!altRes.ok) {
                                pageValid = false;
                                failedCount++;
                                errors.push({
                                    pageUrl,
                                    issue: `Hreflang link (${alt.lang}) -> ${targetAltUrl} returned HTTP ${altRes.status}`,
                                });
                                console.error(`❌ [Hreflang 404] ${pageUrl} -> ${alt.lang}: ${targetAltUrl} (HTTP ${altRes.status})`);
                            }
                        } catch (err) {
                            pageValid = false;
                            failedCount++;
                            errors.push({
                                pageUrl,
                                issue: `Network error checking hreflang link (${alt.lang}) -> ${targetAltUrl}: ${err.message}`,
                            });
                        }
                    }

                    if (pageValid) {
                        passedCount++;
                        console.log(`✅ [OK] ${pageUrl} (${alternates.map(a => `${a.lang}: ${a.href}`).join(' | ')})`);
                    }
                } catch (err) {
                    failedCount++;
                    errors.push({ pageUrl, issue: `Network error fetching ${pageUrl}: ${err.message}` });
                }
            })
        );
        // Small delay between batches to allow dev-server socket pool to breathe
        await new Promise(resolve => setTimeout(resolve, 20));
    }

    console.log(`\n========================================`);
    console.log(`📊 Hreflang Audit Summary for ${BASE_URL}`);
    console.log(`========================================`);
    console.log(`Total URLs Audited: ${pageUrls.size}`);
    console.log(`✅ Passed:  ${passedCount}`);
    console.log(`⚠️ Warnings: ${warningCount}`);
    console.log(`❌ Failed:  ${failedCount}`);

    if (errors.length > 0) {
        console.log(`\n❌ Detailed Error Breakdown:`);
        errors.forEach((err, idx) => {
            console.log(`${idx + 1}. Page: ${err.pageUrl}`);
            console.log(`   Issue: ${err.issue}\n`);
        });
        process.exit(1);
    } else {
        console.log(`\n🎉 All audited pages have valid, 200 OK hreflang links!\n`);
    }
}

runAudit().catch(err => {
    console.error('Fatal error during hreflang audit:', err);
    process.exit(1);
});
