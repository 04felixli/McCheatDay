import React, { useEffect } from "react";
import SortBy from "./SortBy";
import InputFilters from "./InputFilters";
import Button from "./Button";
import { FilterParams } from "../library/Interfaces";
import SelectCategories from "./SelectCategories";

interface FilterOptions {
    filterOptions: FilterParams;
    setFilterOptions: React.Dispatch<React.SetStateAction<FilterParams>>;
    categories: string[];
    getMenuItems: (filterOptions: FilterParams) => void;
    loadCategories: () => void;
}

const SideBar: React.FC<FilterOptions> = ({filterOptions, setFilterOptions, categories, getMenuItems, loadCategories}) => {

      useEffect(() => {
        getMenuItems(filterOptions);
        loadCategories(); 
      }, []);  
          
    return (
      <div className="pr-4 rounded-md hidden md:block">
          <SortBy filterParams={filterOptions} setFilterParams={setFilterOptions} />

          <SelectCategories categories={categories} setFilterParams={setFilterOptions} filterParams={filterOptions}/>

          <div className="bg-gray-100 p-4 rounded-md mt-4 mb-4">
            <InputFilters setFilterParams={setFilterOptions} label='Calories' urlParam='calories'/>
            <InputFilters setFilterParams={setFilterOptions} label='Protein (g)' urlParam='protein'/>
            <InputFilters setFilterParams={setFilterOptions} label='Carbohydrates (g)' urlParam='carbohydrates'/>
            <InputFilters setFilterParams={setFilterOptions} label='Fats (g)' urlParam='fat'/>
          </div>

          <Button filterParams={filterOptions} onClick={getMenuItems} text='Filter' />
        </div>
    );
}

export default SideBar; 
