from flask import Flask, jsonify, request, render_template
import json
import os
import logging
from scraper import scrape_topmate, generate_sample_mentors

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Load mentors data from JSON file
def load_mentors():
    if os.path.exists('mentors.json'):
        try:
            with open('mentors.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logging.error(f"Error loading mentors.json: {e}")
            return []
    return []

# Global variable to store mentors
mentors = load_mentors()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/mentors', methods=['GET'])
def get_mentors():
    category = request.args.get('category', '')
    search = request.args.get('search', '')
    subfilter = request.args.get('subfilter', '')
    
    filtered_mentors = mentors
    
    # Filter by category if specified
    if category:
        filtered_mentors = [m for m in filtered_mentors if m['category'] == category]
    
    # Filter by search term (name only)
    if search:
        filtered_mentors = [m for m in filtered_mentors if search.lower() in m['name'].lower()]
    
    # Filter by secondary filter
    if subfilter:
        filtered_mentors = [m for m in filtered_mentors if subfilter.lower() in m['title'].lower()]
    
    return jsonify(filtered_mentors)

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = list(set(mentor['category'] for mentor in mentors))
    return jsonify(categories)

@app.route('/refresh', methods=['GET'])
def refresh_mentors():
    """Refresh the mentors data by running the scraper"""
    try:
        global mentors
        mentors = scrape_topmate()
        if not mentors:
            mentors = generate_sample_mentors()
        return jsonify({"status": "success", "message": f"Refreshed {len(mentors)} mentors"})
    except Exception as e:
        logging.error(f"Error refreshing mentors: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Define subcategory filters for each main category
def get_subcategory_filters():
    return {
        'data': ['Data Science', 'Data Analysis', 'BI', 'AI/ML', 'Data Engineering'],
        'software': ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps'],
        'mental_health': ['Therapy', 'Counseling', 'Mindfulness', 'Career Guidance'],
        'travel': ['Adventure', 'Budget', 'Luxury', 'Solo Travel'],
        'study_abroad': ['USA', 'UK', 'Canada', 'Australia', 'Europe']
    }

@app.route('/api/filters', methods=['GET'])
def get_filters():
    return jsonify(get_subcategory_filters())

if __name__ == '__main__':
    if not mentors:
        # If no mentors are loaded, try to scrape or generate sample data
        try:
            print("No mentors data found. Running scraper...")
            mentors = scrape_topmate()
            if not mentors:
                print("Scraping failed. Generating sample data...")
                mentors = generate_sample_mentors()
        except Exception as e:
            logging.error(f"Error on initial data loading: {e}")
            print("Error loading data. Generating sample data...")
            mentors = generate_sample_mentors()
    
    print(f"Loaded {len(mentors)} mentors. Starting Flask server...")
    app.run(debug=True)