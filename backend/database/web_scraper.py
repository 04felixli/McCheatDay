from seleniumwire import webdriver
from selenium.webdriver.common.by import By
import json
import gzip
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os

def scrape_mcdonalds_data(output_dir):
    # Set up Selenium WebDriver
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-cache")
    options.add_argument("--incognito") 
    driver = webdriver.Chrome(options=options)

    # Navigate to the McDonald's nutrition calculator page
    url = "https://www.mcdonalds.com/ca/en-ca/about-our-food/nutrition-calculator.html"
    driver.get(url)

    # Wait for the page to load completely
    driver.implicitly_wait(10)
    # Create a .json directory if it doesn't exist
    json_dir = os.path.join(os.path.dirname(__file__), '.json')
    os.makedirs(json_dir, exist_ok=True)

    ### GET ALL MENU ITEM INFO IN JSON ###
    data_element = driver.find_element(By.CLASS_NAME, 'cmp-nutrition-calculator')
    raw_data = data_element.get_attribute('data-product-data')
    all_menu_item_data = json.loads(raw_data)
    with open(os.path.join(json_dir, 'all_menu_item_data.json'), 'w') as file:
        json.dump(all_menu_item_data, file, indent=4)

    num_categories = len(all_menu_item_data['categoryList']) - 1 # exclude happy meal cause it doesn't load
    seen_urls = set()

    for i in range(num_categories):
        select_category_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, f'button.cmp-product-card__button[value="{i}"]'))
        )
        select_category_button.click()

        wait_page_load = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, '//span[@aria-hidden="true" and contains(text(), "Cals")]'))
        )

        print(f'Category: {all_menu_item_data["categoryList"][i]["title"]} Page Loaded')

        filename = all_menu_item_data['categoryList'][i]['title']

        # Intercept and filter by URL
        for request in driver.requests:
            if "itemList" in request.url and request.url not in seen_urls:  # Filter by URL keywords
                seen_urls.add(request.url)
                
                # Check if the response is available
                if request.response:
                    raw_data = request.response.body
                    
                    # Try to decompress using GZIP
                    try:
                        decoded_data = gzip.decompress(raw_data).decode('utf-8')  # Decompress and decode
                    except OSError:  # If not compressed, fallback to plain UTF-8
                        print("Response is not GZIP-compressed, using plain UTF-8 decoding.")
                        decoded_data = raw_data.decode('utf-8')
                    
                    # Parse the JSON data
                    data = json.loads(decoded_data)

                    # Write the data to a file in the .json directory
                    with open(os.path.join(json_dir, f'{filename}.json'), 'w') as file:
                        json.dump(data, file, indent=4)  # Save with pretty formatting
        
        # Go back to the main menu
        back_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@class='cmp-product-card-layout__navigate-button']"))
        )

        # Click the back button
        back_button.click()

    # Close the browser
    driver.quit()
