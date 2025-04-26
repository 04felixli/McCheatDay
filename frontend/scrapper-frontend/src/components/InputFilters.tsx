import React from 'react';
import { FilterParams } from '../library/Interfaces';

interface InputFiltersProps {
    label: string;
    urlParam: string; 
    setFilterParams: React.Dispatch<React.SetStateAction<FilterParams>>;
}

const InputFilters: React.FC<InputFiltersProps> = ({ label, urlParam, setFilterParams }) => {
    const updateFilterParams = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {id, value} = e.target;
        const numericValue = value ? Number(value) : undefined;
        const isMin = id.includes('min');

        setFilterParams((prev) => {
            const current = prev[urlParam];
            return {
                ...prev,
                [urlParam]: {
                    ...current,
                    [isMin ? 'min' : 'max']: numericValue,
                },
            };
        });
    };

    return (
        <div className="my-3">
            <label htmlFor={`${urlParam}-input`} className="block font-medium">
                {label}
            </label>
            <div className='flex flex-col'>
                <label className='ml-3'>Min:</label>
                <input
                    className="ml-3 rounded-md px-2 py-1 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="number"
                    id={`${urlParam}-min-input`}
                    name={`${urlParam}-min-input`}
                    min="0"
                    step="1"
                    onChange={updateFilterParams}
                />
                <label className='ml-3'>Max:</label>
                <input
                    className="ml-3 rounded-md px-2 py-1 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="number"
                    id={`${urlParam}-max-input`}
                    name={`${urlParam}-max-input`}
                    min="0"
                    step="1"
                    onChange={updateFilterParams}
                />
            </div>
        </div>
    );
};

export default InputFilters;
