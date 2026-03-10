export interface MockProduct {
    id: string;
    title: string;
    weight: string;
    price: number;
    image: string;
}

export const MOCK_PRODUCTS: Record<string, MockProduct> = {
    "1": {
        id: "1",
        title: "М'ясні палички з сиром",
        weight: "330г / 340г / 200г",
        price: 2500,
        image: "/images/product-meatballs.jpg", // Using related image
    },
    "2": {
        id: "2",
        title: "Стейк Рібай Dry-aged гриль - М'ясторія",
        weight: "330г",
        price: 3200,
        image: "/images/product-ribeye.jpg",
    },
    "3": {
        id: "3",
        title: "Шашлик зі свинячого ошийка",
        weight: "500г",
        price: 450,
        image: "/images/product-shashlik.jpg",
    },
    "4": {
        id: "4",
        title: "Набір для гриля Великий",
        weight: "2.5кг",
        price: 4500,
        image: "/images/cat-grill.jpg",
    }
};

// Fallback product if ID is not found in the mock dictionary
export const FALLBACK_PRODUCT: MockProduct = {
    id: "unknown",
    title: "Медальйони з яловичини",
    weight: "200г",
    price: 350,
    image: "/images/cat-branded.png"
};
