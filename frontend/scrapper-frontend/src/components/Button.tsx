import React from 'react';
import { FilterParams } from '../library/Interfaces';

interface ButtonProps {
    text: string;
    filterParams?: FilterParams;
    onClick?: (filterParams: FilterParams) => void;
}

const Button: React.FC<ButtonProps> = ({ text, filterParams, onClick }) => {
    return (
        <button
            className='bg-green-overlay hover:bg-green-overlay-hover duration-300 text-white font-bold py-2 px-4 rounded'
            onClick={() => filterParams && onClick && onClick(filterParams)}
        >
            {text}
        </button>
    );
};

export default Button;