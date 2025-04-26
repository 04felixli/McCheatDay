import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Cards from './components/Cards'
import { FilterParams, MenuItem } from './library/Interfaces'
import SideBar from './components/SideBar'
import { fetchCategories, fetchMenuItems } from './library/ApiCalls'
import MobileMenu from './components/MobileMenu'


function App() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const [filterOptions, setFilterOptions] = useState<FilterParams>({
    protein: undefined,
    calories: undefined,
    fat: undefined,
    carbohydrates: undefined,
    categories: [],
    sortBy: [{ field: 'Calories', direction: 'Asc' }],
  });

  const toggleSideBar = () => {
    setIsOpen(!isOpen);
  };

  const [categories, setCategories] = useState<string[]>([]);

    const getMenuItems = async (filterOptions: FilterParams) => {
        try {
          const items = await fetchMenuItems(filterOptions.protein, filterOptions.calories, filterOptions.fat, filterOptions.carbohydrates, filterOptions.categories, filterOptions.sortBy);
          setMenuItems(items);
        } catch (error) {
          console.error('Error fetching menu items from App.tsx:', error);
        }
      };
    
    const loadCategories = async () => {
        try {
          const categories = await fetchCategories();
          setCategories(categories);
        } catch (error) {
          console.error('Error fetching categories from api', error);
        }
    }; 
    
  return (
    <div>
      <Header />
      <div className='flex flex-col md:flex-row mt-12'>
        <div className='h-fit-content hidden md:block'>
          <SideBar filterOptions={filterOptions} setFilterOptions={setFilterOptions} categories={categories} getMenuItems={getMenuItems} loadCategories={loadCategories}/>
        </div>
        <div className='h-fit-content md:hidden'>
          <MobileMenu filterOptions={filterOptions} setFilterOptions={setFilterOptions} setMenuItems={setMenuItems} toggleSideBar={toggleSideBar} isOpen={isOpen} categories={categories} getMenuItems={getMenuItems} loadCategories={loadCategories} />
        </div>
        <div className='mt-5 md:mt-0 md:ml-5 w-full'>
          <Cards menuItems={menuItems} filterParams={filterOptions}/>
        </div>
      </div>
    </div>
  )
}

export default App
