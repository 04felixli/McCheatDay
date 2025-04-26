import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from sqlalchemy.orm import aliased
from flask_cors import CORS
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the NutrientInfo model
class NutrientInfo(db.Model):
    __tablename__ = 'nutrient_info'
    food_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category_id = db.Column(db.Integer, nullable=False)
    protein = db.Column(db.Float, nullable=True)
    fat = db.Column(db.Float, nullable=True)
    carbohydrates = db.Column(db.Float, nullable=True)
    calories = db.Column(db.Float, nullable=True)

# Define the Category model
class Category(db.Model):
    __tablename__ = 'category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

@app.route('/menu_items', methods=['GET'])
def get_menu_items():
    # Parse query parameters
    protein = request.args.get('protein', '', type=str)
    calories = request.args.get('calories', '', type=str)
    fat = request.args.get('fat', '',  type=str)
    carbohydrates = request.args.get('carbohydrates', '', type=str)
    categories = request.args.get('categories', '', type=str)
    sortBy = request.args.get('sortBy', '', type=str)

    # Parse categories as a list if provided
    category_list = []
    if categories:
        try:
            category_list = json.loads(categories)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid categories format. Must be a JSON array."}), 400

    # Create an alias for the Category table
    category_alias = aliased(Category)

    # Build the query
    query = db.session.query(NutrientInfo).join(
        category_alias, NutrientInfo.category_id == category_alias.id
    ).filter(category_alias.name != 'DO NOT SHOW')

    # Apply filters
    query = apply_range_filter(query, 'protein', protein)
    query = apply_range_filter(query, 'calories', calories)
    query = apply_range_filter(query, 'fat', fat)
    query = apply_range_filter(query, 'carbohydrates', carbohydrates)
    
    if category_list:
        query = query.filter(or_(*[category_alias.name.ilike(cat) for cat in category_list]))
    
    if sortBy:
        try:
            sort_criteria = json.loads(sortBy)
            order_clauses = []
            for sort_rule in sort_criteria:
                field = sort_rule.get('field', '').lower()
                direction = sort_rule.get('direction', '').lower()

                # Validate the field and sort direction
                if field not in ['protein', 'calories', 'fat', 'carbohydrates']:
                    return jsonify({"error": f"Invalid field '{field}' in sortBy parameter."}), 400
                if direction not in ['asc', 'desc']:
                    return jsonify({"error": f"Invalid direction '{direction}' in sortBy parameter."}), 400
                
                column = getattr(NutrientInfo, field)
                if column is None:
                    return jsonify({"error": f"Field '{field}' not found"}), 400
                
                if direction == 'asc':
                    order_clauses.append(column.asc())
                else:
                    order_clauses.append(column.desc())
            
            if order_clauses:
                query = query.order_by(*order_clauses)

        except json.JSONDecodeError:
            return jsonify({"error": "Invalid sortBy format. Must be a JSON array."}), 400
        
    # Fetch results
    results = query.all()

    # Format the response
    menu_items = [
        {
            "food_id": item.food_id,
            "name": item.name,
            "category": db.session.query(Category.name).filter(Category.id == item.category_id).scalar(),
            "protein": item.protein,
            "fat": item.fat,
            "carbohydrates": item.carbohydrates,
            "calories": item.calories,
        }
        for item in results
    ]

    return jsonify(menu_items)

@app.route('/categories', methods=['GET'])
def get_categories():
    categories = db.session.query(Category).filter(Category.name != 'DO NOT SHOW').all()
    return jsonify([category.name for category in categories])

# Apply nutrient filters with min/max ranges
def apply_range_filter(query, field_name, field_value):
    if field_value is not None and field_value != '':
        try:
            field_data = json.loads(field_value)
            min_val = field_data.get('min', float('-inf'))
            max_val = field_data.get('max', float('inf'))

            field = getattr(NutrientInfo, field_name)
            query = query.filter(field >= min_val, field <= max_val)

        except (json.JSONDecodeError, AttributeError, TypeError) as e:
            return jsonify({"error": f"Invalid format for {field_name}. Expected JSON with 'min' and 'max'."}), 400
    return query

if __name__ == '__main__':
    app.run(debug=True)
