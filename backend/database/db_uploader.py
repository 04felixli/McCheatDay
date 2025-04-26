import os
import json
from dotenv import load_dotenv
import psycopg2

def upload_data_to_db(json_dir):

    load_dotenv()
    db_name = os.getenv('DB_NAME')
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')
    db_host = os.getenv('DB_HOST')
    db_port = os.getenv('DB_PORT')

    # Connect to the database
    conn = psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=db_password,
        host=db_host, 
        port=db_port
    )

    cursor = conn.cursor()  

    clear_db(cursor); # Clear all data from the database

    # Process each JSON file in the directory
    for file_name in os.listdir(json_dir):
        if file_name == 'all_menu_item_data.json':
            # file_path = os.path.join(json_dir, file_name)
            
            # with open(file_path, 'r') as file:
            #     data = json.load(file)
            
            # # Insert foods into the database
            # insert_foods(cursor, data)
            continue
        else:
            file_path = os.path.join(json_dir, file_name)
            
            with open(file_path, 'r') as file:
                data = json.load(file)
            
            # Insert nutrient info into the database
            insert_info(cursor, data)            
    print("Done inserting foods into the database.")
    # Commit and close the connection
    conn.commit()
    cursor.close()
    conn.close()

def insert_info(cursor, data):
    # Process food items
    items = data.get("items", {}).get("item", [])
    for item in items:
        food_id = item.get("id")
        food_name = item.get("item_name")
        category_name = item.get("default_category", {}).get("category", {}).get("name", "Unknown")
        protein = 0
        fat = 0
        carbohydrates = 0
        calories = 0

        # Extract nutrient facts
        nutrient_facts = item.get("nutrient_facts", {}).get("nutrient", [])
        for nutrient in nutrient_facts:
            nutrient_name = nutrient.get("name").lower()
            nutrient_value = nutrient.get("value", 0)

            if nutrient_name == "protein":
                protein = nutrient_value
            elif nutrient_name == "fat":
                fat = nutrient_value
            elif nutrient_name == "carbohydrates":
                carbohydrates = nutrient_value
            elif nutrient_name == "calories":
                calories = nutrient_value

        # Ensure the category exists and fetch its ID
        category_name = category_name.strip()
        cursor.execute("SELECT id FROM category WHERE name ILIKE %s;", (category_name,))
        category_id = cursor.fetchone()[0] if cursor.rowcount > 0 else None

        if category_id is None:
            cursor.execute("INSERT INTO category (name) VALUES (%s) RETURNING id;", (category_name,))
            category_id = cursor.fetchone()[0]

        # Insert into nutrient_info table
        cursor.execute("""
            INSERT INTO nutrient_info (food_id, name, category_id, protein, fat, carbohydrates, calories)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (food_id) DO UPDATE
            SET name = EXCLUDED.name,
                category_id = EXCLUDED.category_id,
                protein = EXCLUDED.protein,
                fat = EXCLUDED.fat,
                carbohydrates = EXCLUDED.carbohydrates,
                calories = EXCLUDED.calories;
        """, (food_id, food_name, category_id, protein, fat, carbohydrates, calories))


def insert_foods(cursor, data):
    # Process each category in the JSON
    for category in data['categoryList']:
        category_name = category['title'].strip()  # Remove trailing spaces
        
        # Fetch the corresponding food_group_id
        cursor.execute("SELECT id FROM food_group WHERE name ILIKE %s;", (category_name,))
        result = cursor.fetchone()
        
        if result:
            food_group_id = result[0]
        else:
            print(f"Food group '{category_name}' not found in the database.")
            continue  # Skip this category if it doesn't exist

        # Insert foods into the foods table
        for product_id in category.get('productId', []):
            cursor.execute("""
                INSERT INTO foods (food_group_id, food_id)
                VALUES (%s, %s);
            """, (food_group_id, product_id))

def clear_db(cursor):
    try:
        # Disable constraints temporarily to avoid issues with foreign keys
        cursor.execute("SET session_replication_role = 'replica';")
        
        # Clear data from all tables in the correct order
        tables = ["nutrient_info", "category"]
        for table in tables:
            cursor.execute(f"DELETE FROM {table};")
        
        # Re-enable constraints
        cursor.execute("SET session_replication_role = 'origin';")

        print("All data cleared from tables successfully.")
    except Exception as e:
        print(f"Error while clearing tables: {e}")
        raise