import React from 'react';
import { FilterParams } from '../library/Interfaces';

interface SelectCategoriesProps {
    setFilterParams: React.Dispatch<React.SetStateAction<FilterParams>>;
    filterParams: FilterParams;
    categories: string[];
}

const SelectCategories: React.FC<SelectCategoriesProps> = ({ filterParams, setFilterParams, categories }) => {    

    const handleCategoryClick = (category: string) => {
        setFilterParams(prev => {
            const isSelected = prev.categories.includes(category);
            const updatedCategories = isSelected
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: updatedCategories };
        });
    };

    const clearAll = () => {
        setFilterParams(prev => ({ ...prev, categories: [] }));
    };

    return (
        <div className="my-4 bg-gray-100 p-4 rounded-md md:shadow-md">
            <label className="mb-2 font-medium block">Select Categories:</label>

            {/* Clickable category list */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                {categories.map((category) => (
                    <button
                        key={category}
                        type="button"   
                        className={`px-3 py-2 border rounded-md transition-all text-sm ${
                            filterParams.categories.includes(category) 
                                ? 'bg-green-overlay text-white' 
                                : 'bg-white text-gray-800 hover:bg-gray-200 duration-300'
                        }`}
                        onClick={() => handleCategoryClick(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Clear All Button */}
            {filterParams.categories.length > 0 && (
                <button
                    className="mt-3 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-300"
                    onClick={clearAll}
                >
                    Clear All
                </button>
            )}
        </div>
    );
};

export default SelectCategories;
