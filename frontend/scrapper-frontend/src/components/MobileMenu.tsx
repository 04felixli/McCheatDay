import React, { useEffect } from "react";
import SortBy from "./SortBy";
import InputFilters from "./InputFilters";
import Button from "./Button";
import { FilterParams, MenuItem } from "../library/Interfaces";
import SelectCategories from "./SelectCategories";
import { motion, AnimatePresence } from "framer-motion";

interface FilterOptions {
    filterOptions: FilterParams;
    setFilterOptions: React.Dispatch<React.SetStateAction<FilterParams>>;
    setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    categories: string[];
    getMenuItems: (filterOptions: FilterParams) => void;
    loadCategories: () => void;
    toggleSideBar?: () => void;
    isOpen?: boolean;
}

const MobileMenu: React.FC<FilterOptions> = ({ filterOptions, setFilterOptions, toggleSideBar, categories, getMenuItems, loadCategories, isOpen }) => {
  
    useEffect(() => {
        getMenuItems(filterOptions);
        loadCategories();
    }, []);

    // Framer Motion animation settings
    const dropInVariants = {
        hidden: { y: -20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { y: -20, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }
    };

    return (
      <>
        {/* Toggle Filters Button */}
        <div className="flex justify-center items-center">
            <button
                className={`md:hidden bg-gray-100 px-4 py-2 ${isOpen ? "rounded-t-md" : "rounded-md"} w-full hover:bg-gray-300 transition-300`}
                onClick={toggleSideBar}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-lg">{isOpen ? "Hide Filters" : "Show Filters"}</h2>
                    {/* Animated arrow */}
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-xl"
                    >
                        ▼
                    </motion.div>
                </div>
            </button>
        </div>

        {/* Animated Filters Section */}
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    variants={dropInVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="md:hidden p-4 rounded-b-md mb-4 bg-gray-100"
                >
                    <SortBy filterParams={filterOptions} setFilterParams={setFilterOptions} />

                    <SelectCategories categories={categories} setFilterParams={setFilterOptions} filterParams={filterOptions} />

                    <div className="p-4 rounded-md mt-4 mb-4">
                        <InputFilters setFilterParams={setFilterOptions} label='Calories' urlParam='calories'/>
                        <InputFilters setFilterParams={setFilterOptions} label='Protein (g)' urlParam='protein'/>
                        <InputFilters setFilterParams={setFilterOptions} label='Carbohydrates (g)' urlParam='carbohydrates'/>
                        <InputFilters setFilterParams={setFilterOptions} label='Fats (g)' urlParam='fat'/>
                    </div>

                    <Button filterParams={filterOptions} onClick={getMenuItems} text='Filter' />
                </motion.div>
            )}
        </AnimatePresence>
      </>
    );
}

export default MobileMenu;
