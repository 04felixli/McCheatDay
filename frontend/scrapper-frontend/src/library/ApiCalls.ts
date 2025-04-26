import { MenuItem } from "./Interfaces";

export const fetchMenuItems = async (
    protein?: { min: number; max: number },
    calories?: { min: number; max: number },
    fat?: {min: number; max: number},
    carbohydrates?: {min: number; max: number},
    categories: string[] = [],
    sortBy: { field: string; direction: string }[] = [{ field: 'calories', direction: 'desc' }]
): Promise<MenuItem[]> => {
    const apiUrl: string | undefined = import.meta.env.VITE_BASE_URL;

    // Construct query parameters dynamically
    const params = new URLSearchParams();

    // Add numeric filters if provided
    if (protein !== undefined) params.append('protein', JSON.stringify(protein));
    if (calories !== undefined) params.append('calories', JSON.stringify(calories));
    if (fat !== undefined) params.append('fat', JSON.stringify(calories));
    if (carbohydrates !== undefined) params.append('carbohydrates', JSON.stringify(calories));

    // Encode categories array as JSON string
    if (categories.length > 0) {
        params.append('categories', JSON.stringify(categories));
    }

    // Encode sortBy array as JSON string
    if (sortBy.length > 0) {
        params.append('sortBy', JSON.stringify(sortBy));
    }

    const url = `${apiUrl}/menu_items?${params.toString()}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: MenuItem[] = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching menu items:', error);
        return [];
    }
};

export const fetchCategories = async (): Promise<string[]> => {
    const apiUrl: string | undefined = import.meta.env.VITE_BASE_URL;

    try {
        const response = await fetch(`${apiUrl}/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: string[] = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}