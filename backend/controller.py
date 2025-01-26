import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from sqlalchemy.orm import aliased
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)
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
    protein = request.args.get('protein', type=float)
    calories = request.args.get('calories', type=float)
    fat = request.args.get('fat', type=float)
    carbohydrates = request.args.get('carbohydrates', type=float)
    categories = request.args.get('categories', type=str)
    optimize = request.args.get('optimize', type=str)

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
    )

    # Apply filters
    if protein is not None:
        query = query.filter(NutrientInfo.protein >= protein)
    if calories is not None:
        query = query.filter(NutrientInfo.calories <= calories)
    if fat is not None:
        query = query.filter(NutrientInfo.fat <= fat)
    if carbohydrates is not None:
        query = query.filter(NutrientInfo.carbohydrates <= carbohydrates)
    if category_list:
        query = query.filter(or_(*[category_alias.name.ilike(cat) for cat in category_list]))

    # Optimize for calories
    if optimize == 'minimize':
        query = query.order_by(NutrientInfo.calories.asc())
    elif optimize == 'maximize':
        query = query.order_by(NutrientInfo.calories.desc())
    
    # Always order by protein descending as a fallback
    query = query.order_by(NutrientInfo.protein.desc())

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

if __name__ == '__main__':
    app.run(debug=True)
