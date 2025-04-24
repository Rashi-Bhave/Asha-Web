import requests
from bs4 import BeautifulSoup
import json
import time
import random
import os
import re

def scrape_topmate_experts(category_id=None, page=1):
    """
    Highly targeted scraper for experts from Topmate based on the exact HTML structure
    """
    # Base URL
    base_url = "https://topmate.io/marketplace"
    
    # Add category and page parameters if provided
    params = []
    if category_id:
        params.append(f"category={category_id}")
    if page > 1:
        params.append(f"page={page}")
    
    # Construct the full URL
    url = f"{base_url}{'?' + '&'.join(params) if params else ''}"
    
    # Set up headers with different user agents to avoid blocking
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
    ]
    
    headers = {
        'User-Agent': random.choice(user_agents),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
    }
    
    print(f"Fetching: {url}")
    
    try:
        # Add a delay to avoid rate limiting
        time.sleep(random.uniform(2, 5))
        
        # Make the request
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            print(f"Error: Received status code {response.status_code}")
            return []
        
        # Save HTML for debugging
        os.makedirs("debug_html", exist_ok=True)
        with open(f"debug_html/topmate_cat{category_id or 'all'}_page{page}.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find expert cards based on the exact HTML structure from your screenshot
        experts_data = []
        
        # Find the link elements that contain the cards
        # First, try to find direct links to expert profiles
        expert_links = soup.select('a[class*="ExpertsShowcase_ES_Expert_Card_Link"]')
        
        if not expert_links:
            # Try to find the card divs if links aren't available
            expert_cards = soup.select('div[class*="ExpertsShowcase_ES_Expert_Card"]')
            
            # If we found cards but not links, try to get links from within cards
            if expert_cards:
                for card in expert_cards:
                    link = card.select_one('a')
                    if link:
                        expert_links.append(link)
        
        print(f"Found {len(expert_links)} expert links")
        
        for i, link in enumerate(expert_links):
            try:
                # Extract the profile URL
                profile_url = link.get('href', '')
                if profile_url and not profile_url.startswith('http'):
                    profile_url = f"https://topmate.io{profile_url}"
                
                # Find the name element based on the exact class from your screenshot
                name_element = link.select_one('div[class*="ExpertsShowcase_ES_Expert_Card_Name"]')
                name = name_element.get_text().strip() if name_element else ""
                
                if not name:
                    # Fallback: try other selectors
                    name_element = link.select_one('.ant-typography-ellipsis-single-line')
                    name = name_element.get_text().strip() if name_element else "Unknown"
                
                # Find image
                img = link.select_one('img[alt*="profile pic"]')
                img_src = ''
                if img:
                    img_src = img.get('src', '')
                    # If alt text has the name and image src doesn't, use it as backup
                    if not name and 'alt' in img.attrs:
                        name = img['alt'].replace('profile pic', '').strip()
                
                # Find the title/subtitle/description
                desc_element = link.select_one('div[class*="ExpertsShowcase_ES_Expert_Card_Desc"]')
                title = desc_element.get_text().strip() if desc_element else ""
                
                # Find the rating
                rating_element = link.select_one('div[class*="ExpertsShowcase_ES_Expert_Card_Ratings"]')
                rating = rating_element.get_text().strip() if rating_element else "5/5"
                
                # Find tags for bookings, calls, etc.
                tag_elements = link.select('div[class*="ExpertsShowcase_ES_Expert_Card_Tag"]')
                
                bookings = ""
                call_type = ""
                priority = ""
                
                for tag in tag_elements:
                    text = tag.get_text().strip()
                    if "bookings" in text.lower():
                        bookings = text
                    elif "call" in text.lower():
                        call_type = text
                    elif "priority" in text.lower() or "dm" in text.lower():
                        priority = text
                
                # Create expert data object
                expert = {
                    'id': f"expert-{i}",
                    'name': name,
                    'title': title,
                    'rating': rating,
                    'bookings': bookings,
                    'call_type': call_type,
                    'priority': priority,
                    'image': img_src,
                    'profile_url': profile_url,
                    'subcategories': []  # Will be populated later
                }
                
                print(f"Extracted expert: {name}")
                experts_data.append(expert)
                
            except Exception as e:
                print(f"Error parsing link {i}: {e}")
        
        return experts_data
    
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

def scrape_all_categories():
    """
    Scrape experts from all predefined categories
    """
    categories = [
        {"id": "1182", "name": "Data"},
        {"id": "1179", "name": "Software"},
        {"id": "124", "name": "Mental Health"},
        {"id": "128", "name": "Travel"},
        {"id": "117", "name": "Study Abroad"}
    ]
    
    all_experts = []
    
    for category in categories:
        print(f"\nScraping category: {category['name']} (ID: {category['id']})")
        
        # Scrape first 3 pages for each category
        category_experts = []
        for page in range(1, 4):
            experts = scrape_topmate_experts(category['id'], page)
            
            if not experts:
                print(f"No experts found on page {page} for {category['name']}")
                break
            
            # Add category information to experts
            for expert in experts:
                expert['category'] = category['name']
                expert['category_id'] = category['id']
                
                # Assign default subcategories based on category
                if category['name'] == "Data":
                    expert['subcategories'] = ["Data Science", "Data Analysis", "Machine Learning"][:random.randint(1, 3)]
                elif category['name'] == "Software":
                    expert['subcategories'] = ["Backend Development", "Frontend Development", "Mobile Development"][:random.randint(1, 3)]
                elif category['name'] == "Mental Health":
                    expert['subcategories'] = ["Therapy", "Counseling", "Wellness"][:random.randint(1, 3)]
                elif category['name'] == "Travel":
                    expert['subcategories'] = ["Adventure Travel", "Budget Travel", "Travel Planning"][:random.randint(1, 3)]
                elif category['name'] == "Study Abroad":
                    expert['subcategories'] = ["College Applications", "Visa Support", "Scholarships"][:random.randint(1, 3)]
            
            category_experts.extend(experts)
            
            # Save intermediate results for this page
            with open(f"topmate_{category['name'].lower().replace(' ', '_')}_page{page}.json", "w", encoding="utf-8") as f:
                json.dump(experts, f, ensure_ascii=False, indent=4)
            
            print(f"Saved {len(experts)} experts from {category['name']} page {page}")
            
            # Add a delay before fetching the next page
            if page < 3:
                delay = random.uniform(3, 6)
                print(f"Waiting {delay:.2f} seconds before fetching next page...")
                time.sleep(delay)
        
        # Add experts from this category to overall list
        all_experts.extend(category_experts)
        
        print(f"Total experts from {category['name']}: {len(category_experts)}")
        
        # Add a longer delay between categories
        if category != categories[-1]:
            delay = random.uniform(5, 10)
            print(f"Waiting {delay:.2f} seconds before next category...")
            time.sleep(delay)
    
    return all_experts

def create_mock_experts():
    """
    Create mock experts data in case the scraper fails
    """
    categories = [
        {"id": "1182", "name": "Data"},
        {"id": "1179", "name": "Software"},
        {"id": "124", "name": "Mental Health"},
        {"id": "128", "name": "Travel"},
        {"id": "117", "name": "Study Abroad"}
    ]
    
    mock_experts = []
    
    for category in categories:
        subcategories = []
        
        if category['name'] == "Data":
            subcategories = ["Data Science", "Data Analysis", "Machine Learning", "AI/ML", "Data Visualization"]
            titles = [
                "Data Scientist at Google",
                "Data Analyst at Amazon",
                "Machine Learning Engineer at Microsoft",
                "AI Researcher at Meta",
                "Data Engineer at Netflix"
            ]
        elif category['name'] == "Software":
            subcategories = ["Backend Development", "Frontend Development", "Full Stack", "Mobile Development", "DevOps"]
            titles = [
                "Software Engineer at Amazon",
                "Full Stack Developer at Microsoft",
                "iOS Developer at Apple",
                "Android Developer at Google",
                "Backend Engineer at Netflix"
            ]
        elif category['name'] == "Mental Health":
            subcategories = ["Therapy", "Counseling", "Stress Management", "Wellness", "Mindfulness"]
            titles = [
                "Psychologist",
                "Mental Health Counselor",
                "Wellness Coach",
                "Therapist",
                "Mindfulness Expert"
            ]
        elif category['name'] == "Travel":
            subcategories = ["Adventure Travel", "Budget Travel", "Luxury Travel", "Travel Planning", "Digital Nomad"]
            titles = [
                "Travel Blogger",
                "Adventure Guide",
                "Travel Consultant",
                "Digital Nomad Coach",
                "Travel Planner"
            ]
        elif category['name'] == "Study Abroad":
            subcategories = ["College Applications", "Visa Support", "Scholarships", "Student Life", "Language Learning"]
            titles = [
                "Study Abroad Consultant",
                "College Counselor",
                "Visa Expert",
                "International Education Advisor",
                "Foreign University Specialist"
            ]
        
        # First names and last names for generating mock data
        first_names = ["Aisha", "Rahul", "Priya", "Vikram", "Neha", "Arjun", "Divya", "Sanjay", "Meera", "Rajiv"]
        last_names = ["Sharma", "Patel", "Singh", "Kumar", "Gupta", "Shah", "Reddy", "Joshi", "Kapoor", "Verma"]
        
        # Create 8 mock experts for each category
        for i in range(8):
            name = f"{first_names[i % len(first_names)]} {last_names[i % len(last_names)]}"
            
            expert = {
                'id': f"{category['id']}-mock-{i}",
                'name': name,
                'title': titles[i % len(titles)],
                'rating': "5/5",
                'bookings': f"{random.randint(10, 99)}+ bookings",
                'call_type': "1:1 Call",
                'priority': "Priority DM",
                'image': f"https://randomuser.me/api/portraits/{'women' if i % 2 == 0 else 'men'}/{random.randint(1, 99)}.jpg",
                'profile_url': "https://topmate.io/experts",
                'category': category['name'],
                'category_id': category['id'],
                'subcategories': random.sample(subcategories, min(3, len(subcategories)))
            }
            
            mock_experts.append(expert)
    
    return mock_experts

def extract_subcategories(experts):
    """
    Extract unique subcategories from experts data
    """
    category_subcats = {}
    
    for expert in experts:
        category = expert['category']
        if category not in category_subcats:
            category_subcats[category] = set()
        
        for subcat in expert.get('subcategories', []):
            category_subcats[category].add(subcat)
    
    # Convert sets to lists for JSON serialization
    return {cat: list(subcats) for cat, subcats in category_subcats.items()}

if __name__ == "__main__":
    print("Starting Topmate experts scraper...")
    
    # Create output directory
    os.makedirs('public/data', exist_ok=True)
    
    # Try to scrape experts
    experts = scrape_all_categories()
    
    # If scraping fails, create mock data
    if not experts:
        print("Scraping failed, creating mock experts data...")
        experts = create_mock_experts()
    
    # Extract subcategories
    subcategories = extract_subcategories(experts)
    
    # Save to JSON files
    with open("public/data/topmate_mentors.json", "w", encoding="utf-8") as f:
        json.dump(experts, f, ensure_ascii=False, indent=4)
    
    with open("public/data/topmate_subcategories.json", "w", encoding="utf-8") as f:
        json.dump(subcategories, f, ensure_ascii=False, indent=4)
    
    print(f"Saved {len(experts)} experts to public/data/topmate_mentors.json")
    print(f"Saved subcategories from {len(subcategories)} categories to public/data/topmate_subcategories.json")
    
    # Create a fallback copy for future runs
    with open("topmate_fallback.json", "w", encoding="utf-8") as f:
        json.dump(experts, f, ensure_ascii=False, indent=4)
    
    print("Done!")