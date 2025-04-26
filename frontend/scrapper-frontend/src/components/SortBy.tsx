import React, { useState } from 'react';
import { FilterParams } from '../library/Interfaces';

interface SortByProps {
    filterParams: FilterParams;
    setFilterParams: React.Dispatch<React.SetStateAction<FilterParams>>;
}

const SORT_FIELDS = ['Calories', 'Protein', 'Fat', 'Carbohydrates'];
const SORT_DIRECTIONS = ['Asc', 'Desc'];

const SortBy: React.FC<SortByProps> = ({ filterParams, setFilterParams }) => {
    const [sortRules, setSortRules] = useState<{ field: string; direction: 'Asc' | 'Desc' }[]>(
        filterParams.sortBy || []
    );

    // Add a new sorting rule
    const addSortRule = () => {
        setSortRules([...sortRules, { field: 'Calories', direction: 'Asc' }]);
    };

    // Update a rule when user selects a field or direction
    const updateRule = (index: number, key: 'field' | 'direction', value: string) => {
        const updatedRules = sortRules.map((rule, i) =>
            i === index ? { ...rule, [key]: value } : rule
        );
        setSortRules(updatedRules);
        setFilterParams((prev) => ({ ...prev, sortBy: updatedRules }));
    };

    // Remove a rule
    const removeRule = (index: number) => {
        const updatedRules = sortRules.filter((_, i) => i !== index);
        setSortRules(updatedRules);
        setFilterParams((prev) => ({ ...prev, sortBy: updatedRules }));
    };

    return (
        <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-medium mb-2">Sort By:</h3>
            {sortRules.map((rule, index) => (
                <div key={index} className="flex items-center mb-2 gap-2">
                    {/* Field Selector */}
                    <select
                        value={rule.field}
                        onChange={(e) => updateRule(index, 'field', e.target.value)}
                        className="px-2 py-1 border rounded"
                    >
                        {SORT_FIELDS.map((field) => (
                            <option key={field} value={field}>
                                {field}
                            </option>
                        ))}
                    </select>

                    {/* Direction Selector */}
                    <select
                        value={rule.direction}
                        onChange={(e) => updateRule(index, 'direction', e.target.value)}
                        className="px-2 py-1 border rounded"
                    >
                        {SORT_DIRECTIONS.map((dir) => (
                            <option key={dir} value={dir}>
                                {dir}
                            </option>
                        ))}
                    </select>

                    {/* Remove Button */}
                    {index !== 0 && <button
                        onClick={() => removeRule(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 duration-300"
                    >
                        Remove
                    </button>}
                </div>
            ))}

            {/* Add New Sort Rule */}
            <button
                onClick={addSortRule}
                className="mt-2 px-3 py-1 bg-green-overlay font-bold text-white rounded hover:bg-green-overlay-hover duration-300"
            >
                Add Sort Rule
            </button>
        </div>
    );
};

export default SortBy;
