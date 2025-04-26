import React, { useState } from 'react';
import { FilterParams, MenuItem } from '../library/Interfaces';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItemProp {
    menuItems: MenuItem[];
    filterParams: FilterParams;
}

const Cards: React.FC<MenuItemProp> = ({ menuItems, filterParams }) => {
    const [openCards, setOpenCards] = useState<Set<number>>(new Set());

    // Toggle details visibility
    const toggleDetails = (index: number) => {
        setOpenCards((prev) => {
            const newSet = new Set(prev);
            newSet.has(index) ? newSet.delete(index) : newSet.add(index);
            return newSet;
        });
    };

    // Calculate progress percentage
    const calculateProgress = (value: number, metric: keyof FilterParams) => {
        const metricParams = filterParams[metric] as { min: number; max: number } | undefined;
        const min = metricParams?.min ?? 0;
        const max = metricParams?.max ?? 100;

        if (value <= min) return 0;
        if (value >= max) return 100;
        return ((value - min) / (max - min)) * 100;
    };

    const metricColors: Record<string, string> = {
        calories: 'bg-[#C3B1E1]',
        protein: 'bg-[#FFD8B1]',
        carbohydrates: 'bg-[#A9D6E5]',
        fat: 'bg-[#FFC1CC]',
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <p className='text-gray-700 font-medium'>{menuItems.length} Items</p>
            </div>  

            {menuItems.map((item, index) => (
                <div 
                    key={index} 
                    className="bg-gray-100 p-4 rounded-md shadow-md mb-3 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => toggleDetails(index)}
                >
                    {/* Card Header - Item Name */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">{item.name}</h2>
                        {/* Animated arrow */}
                        <motion.div
                            animate={{ rotate: openCards.has(index) ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-xl"
                        >
                            ▼
                        </motion.div>
                    </div>

                    {/* Animated Dropdown Details */}
                    <AnimatePresence>
                        {openCards.has(index) && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="mt-3 space-y-2 overflow-hidden"
                            >
                                <p className="mt-2 text-sm text-gray-600">Category: {item.category}</p>
                                {['calories', 'protein', 'carbohydrates', 'fat'].map((metric) => {
                                    const value = item[metric as keyof MenuItem];
                                    const progress = calculateProgress(value as number, metric as keyof FilterParams);

                                    return (
                                        <div key={metric} className='flex flex-col'>
                                            <p className="mb-1 text-sm font-medium">
                                                {metric.charAt(0).toUpperCase() + metric.slice(1)}: {value}
                                            </p>
                                            <div className="w-full h-4 bg-gray-300 rounded-md overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ duration: 0.7, ease: 'easeOut' }}
                                                    className={`h-full ${metricColors[metric]}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

export default Cards;
