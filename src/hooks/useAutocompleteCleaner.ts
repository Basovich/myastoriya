import { useEffect } from 'react';

const CITY_PATTERNS = [
    /,?\s*(?<![а-яА-ЯёЁіІїЇєЄґҐ])(Київ|Киев|Kyiv)(?![а-яА-ЯёЁіІїЇєЄґҐ]),?\s*(?<![а-яА-ЯёЁіІїЇєЄґҐ])(Україна|Украина|Ukraine)(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi,
    /,?\s*(?<![а-яА-ЯёЁіІїЇєЄґҐ])(Україна|Украина|Ukraine)(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi,
    /,?\s*(?<![а-яА-ЯёЁіІїЇєЄґҐ])(Київ|Киев|Kyiv)(?![а-яА-ЯёЁіІїЇєЄґҐ])/gi,
];

function stripCityCountry(text: string): string {
    let result = text;
    for (const pattern of CITY_PATTERNS) {
        result = result.replace(pattern, '');
    }
    return result.replace(/^,\s*/, '').replace(/,\s*$/, '').trim();
}

/**
 * A React hook that observes Google Maps Autocomplete dropdown elements (.pac-container)
 * and dynamically strips city/country names ("Київ", "Україна") from the secondary
 * description spans of suggestion items.
 *
 * NOTE: POI/establishment filtering is handled at the API level via `types: ['address']`.
 * This hook only removes geographical noise from otherwise valid address results.
 */
export function useAutocompleteCleaner() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const cleanPacItems = (container: Element) => {
            const items = container.querySelectorAll('.pac-item');
            items.forEach((item) => {
                const querySpan = item.querySelector('.pac-item-query');
                const mainText = (querySpan?.textContent ?? '').trim();

                item.querySelectorAll('span:not(.pac-item-query)').forEach((span) => {
                    // Skip nested spans (like .pac-matched inside .pac-item-query)
                    if (span.parentElement !== item) return;

                    const original = span.textContent ?? '';
                    const cleaned = stripCityCountry(original);

                    // Hide secondary span if it's now empty OR identical to the main query text
                    const shouldHide = !cleaned || cleaned.toLowerCase() === mainText.toLowerCase();

                    if (shouldHide) {
                        if ((span as HTMLElement).style.display !== 'none') {
                            (span as HTMLElement).style.display = 'none';
                        }
                    } else {
                        if ((span as HTMLElement).style.display === 'none') {
                            (span as HTMLElement).style.display = '';
                        }
                        if (span.textContent !== cleaned) {
                            span.textContent = cleaned;
                        }
                    }
                });
            });
        };

        const activeObservers: MutationObserver[] = [];

        const observeContainer = (container: Element) => {
            cleanPacItems(container);
            const containerObserver = new MutationObserver(() => cleanPacItems(container));
            containerObserver.observe(container, { childList: true, subtree: true });
            activeObservers.push(containerObserver);
        };

        const bodyObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof Element) {
                        if (node.classList.contains('pac-container')) {
                            observeContainer(node);
                        } else {
                            node.querySelectorAll('.pac-container').forEach(observeContainer);
                        }
                    }
                });
            });
        });

        bodyObserver.observe(document.body, { childList: true, subtree: true });

        document.querySelectorAll('.pac-container').forEach(observeContainer);

        return () => {
            bodyObserver.disconnect();
            activeObservers.forEach((obs) => obs.disconnect());
        };
    }, []);
}
