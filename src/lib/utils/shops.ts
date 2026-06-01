import { Shop } from "../graphql/queries/shops";
import { Store } from "@/app/components/OurStores/StoreCard/StoreCard";

/**
 * Parses raw Shop data from the GraphQL API into the Store format required by the UI.
 */
export const parseShopData = (shop: Shop): Store => {
    const fullName = shop.name;
    let parsedAddress = '';
    
    // First, check for parenthesized address like "Brand (Address)"
    const parenMatch = fullName.match(/^(.*?)\((.*?)\)$/);
    if (parenMatch) {
        parsedAddress = parenMatch[2].trim();
    } else {
        // If no parentheses, check for comma delimiter e.g. "Brand, Address"
        const commaIndex = fullName.indexOf(',');
        if (commaIndex !== -1) {
            parsedAddress = fullName.slice(commaIndex + 1).trim();
        }
    }
    
    const isMeatBar = !shop.isCompanyStore;
    const name = shop.siteName || fullName;
    const address = shop.siteAddress || parsedAddress || fullName;
    
    return {
        id: shop.id,
        name: name,
        type: isMeatBar ? "meatbar" : "restaurant",
        address: address,
        workingHours: shop.schedule?.map(s => `${s.days}: ${s.workTime}`) || [],
        phone: shop.phones?.[0] || "",
        email: shop.email || "",
        lat: shop.lat || 0,
        lng: shop.lng || 0,
        image: shop.image?.size2x || "/images/store/herobanner.png",
        mapUrl: shop.lat && shop.lng 
            ? `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        isOpen: shop.isOpen
    };
};
