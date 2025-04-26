export enum OptimizeOptions {
    minimize = 'minimize',
    maximize = 'maximize'
}

export interface MenuItem {
    name: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    category: string;
    food_id: number;
}

export interface FilterParams {
    protein?: { min: number; max: number };
    calories?: { min: number; max: number };
    fat?: { min: number; max: number };
    carbohydrates?: { min: number; max: number };
    categories: string[];
    sortBy?: { field: string; direction: 'Asc' | 'Desc' }[];
    [key: string]: any;
}