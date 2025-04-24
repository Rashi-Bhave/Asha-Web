import requests
from bs4 import BeautifulSoup
import json
import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def scrape_topmate():
    # Categories to scrape with their IDs
    categories = {
        "data": 1182,
        "software": 1179,
        "mental_health": 124,
        "travel": 128,
        "study_abroad": 117
    }
    
    # Store all mentors here
    all_mentors = []
    
    # Set up Chrome options for headless browsing
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920x1080")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    # Create the WebDriver with auto-installed ChromeDriver
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        print("WebDriver initialized successfully.")
    except Exception as e:
        print(f"Error initializing WebDriver: {e}")
        return []
    
    try:
        for category_name, category_id in categories.items():
            print(f"Scraping category: {category_name}")
            # Scrape first 2 pages for each category
            for page in range(1, 3):
                url = f"https://topmate.io/marketplace?category={category_id}&page={page}"
                print(f"  Scraping page {page} at URL: {url}")
                
                try:
                    driver.get(url)
                    
                    # Wait for the page to load
                    WebDriverWait(driver, 10).until(
                        EC.presence_of_element_located((By.CLASS_NAME, "ant-row"))
                    )
                    
                    # Wait a bit more for JavaScript to render
                    time.sleep(3)
                    
                    # Get the page source after JavaScript has rendered
                    page_source = driver.page_source
                    soup = BeautifulSoup(page_source, 'html.parser')
                    
                    # Find all mentor cards
                    mentor_cards = soup.select('.ant-row .ant-col-xs-22')
                    
                    print(f"  Found {len(mentor_cards)} mentor cards")
                    
                    for card in mentor_cards:
                        try:
                            # Find the mentor name
                            name_elem = card.select_one('h3')
                            name = name_elem.text.strip() if name_elem else "Unknown"
                            
                            # Find title/position
                            title_elem = card.select_one('.ant-flex-stretch')
                            title = title_elem.text.strip() if title_elem else ""
                            
                            # Find rating
                            rating_elem = card.select_one('div:-soup-contains("/")')
                            rating = rating_elem.text.strip() if rating_elem else "5/5"
                            
                            # Find bookings
                            bookings_elem = card.select_one('div:-soup-contains("bookings")')
                            bookings = bookings_elem.text.strip() if bookings_elem else "0+ bookings"
                            
                            # Find call type
                            call_elem = card.select_one('div:-soup-contains("Call")')
                            call_type = call_elem.text.strip() if call_elem else "1:1 Call"
                            
                            # Find profile link
                            link_elem = card.select_one('a')
                            profile_link = f"https://topmate.io{link_elem['href']}" if link_elem and 'href' in link_elem.attrs else ""
                            
                            # Find profile image
                            img_elem = card.select_one('img')
                            profile_image = img_elem['src'] if img_elem and 'src' in img_elem.attrs else ""
                            
                            # Create mentor object
                            mentor = {
                                'name': name,
                                'title': title,
                                'rating': rating,
                                'bookings': bookings,
                                'call_type': call_type,
                                'profile_image': profile_image,
                                'profile_link': profile_link,
                                'category': category_name
                            }
                            
                            all_mentors.append(mentor)
                            print(f"    Added mentor: {name}")
                            
                        except Exception as e:
                            print(f"    Error extracting mentor data: {e}")
                    
                except Exception as e:
                    print(f"  Error scraping URL {url}: {e}")
                
                # Add a delay between pages
                time.sleep(random.uniform(1, 2))
            
            # Add a delay between categories
            time.sleep(random.uniform(2, 3))
            
    except Exception as e:
        print(f"Error during scraping: {e}")
    finally:
        # Close the WebDriver
        driver.quit()
        print("WebDriver closed.")
    
    # Save mentors to a JSON file
    if all_mentors:
        with open('mentors.json', 'w', encoding='utf-8') as f:
            json.dump(all_mentors, f, ensure_ascii=False, indent=4)
        
        print(f"Scraped {len(all_mentors)} mentors and saved to mentors.json")
    else:
        print("No mentors found to save.")
    
    return all_mentors

# Alternative method if Selenium doesn't work - use direct HTML parsing
def scrape_topmate_simple():
    """Simpler alternative that doesn't require Selenium but may be less reliable"""
    categories = {
        "data": 1182,
        "software": 1179,
        "mental_health": 124,
        "travel": 128,
        "study_abroad": 117
    }
    
    all_mentors = []
    
    for category_name, category_id in categories.items():
        print(f"Scraping category: {category_name}")
        for page in range(1, 3):
            url = f"https://topmate.io/marketplace?category={category_id}&page={page}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            try:
                response = requests.get(url, headers=headers)
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # This is a simplified approach - may not work if JS rendering is required
                mentor_cards = soup.select('.ant-row .ant-col')
                
                for card in mentor_cards:
                    try:
                        name_elem = card.select_one('h3')
                        if not name_elem:
                            continue
                            
                        name = name_elem.text.strip()
                        title = card.select_one('.ant-flex-stretch').text.strip() if card.select_one('.ant-flex-stretch') else ""
                        
                        # Extract other details...
                        profile_link = ""
                        link_elem = card.select_one('a')
                        if link_elem and 'href' in link_elem.attrs:
                            profile_link = f"https://topmate.io{link_elem['href']}"
                        
                        img_elem = card.select_one('img')
                        profile_image = img_elem['src'] if img_elem and 'src' in img_elem.attrs else ""
                        
                        mentor = {
                            'name': name,
                            'title': title,
                            'rating': "5/5",  # May need better extraction
                            'bookings': "0+ bookings",  # May need better extraction
                            'call_type': "1:1 Call",  # May need better extraction
                            'profile_image': profile_image,
                            'profile_link': profile_link,
                            'category': category_name
                        }
                        
                        all_mentors.append(mentor)
                        
                    except Exception as e:
                        print(f"Error extracting mentor: {e}")
                
            except Exception as e:
                print(f"Error scraping page {page} of {category_name}: {e}")
            
            # Add delay between pages
            time.sleep(random.uniform(1, 2))
    
    # Save mentors to JSON
    if all_mentors:
        with open('mentors.json', 'w', encoding='utf-8') as f:
            json.dump(all_mentors, f, ensure_ascii=False, indent=4)
    
    return all_mentors

# Generate sample data if scraping fails
def generate_sample_mentors():
    """Generate sample mentor data in case scraping fails"""
    categories = ["data", "software", "mental_health", "travel", "study_abroad"]
    
    sample_mentors = []
    
    # Sample names
    names = [
        "Rahul Singh", "Priya Sharma", "Aakash Patel", "Neha Gupta", 
        "Vikram Mehta", "Anjali Desai", "Arjun Kumar", "Divya Reddy",
        "Ravi Verma", "Meera Joshi", "Kiran Shah", "Pooja Malhotra",
        "Sanjay Kapoor", "Ananya Mishra", "Arun Khanna", "Nisha Agarwal",
        "Sunil Choudhury", "Kavita Nair", "Deepak Menon", "Swati Jain"
    ]
    
    # Sample titles for each category
    titles = {
        "data": [
            "Data Scientist at Google", "Senior Data Analyst at Amazon",
            "ML Engineer at Microsoft", "Data Analytics Lead at Flipkart",
            "BI Developer at Myntra"
        ],
        "software": [
            "Senior Software Engineer at Facebook", "Full Stack Developer at PayPal",
            "Backend Engineer at Uber", "iOS Developer at Swiggy",
            "Frontend Developer at Zomato"
        ],
        "mental_health": [
            "Psychologist & Life Coach", "Mental Health Counselor",
            "Mindfulness Expert", "Therapist & Wellness Coach",
            "Anxiety Management Specialist"
        ],
        "travel": [
            "Travel Blogger & Consultant", "Adventure Trip Planner",
            "Budget Travel Expert", "International Tour Guide",
            "Solo Travel Advisor"
        ],
        "study_abroad": [
            "Study Abroad Consultant", "US University Admissions Expert",
            "UK Education Counselor", "Canada Immigration Advisor",
            "Australia Education Specialist"
        ]
    }
    
    # Generate 40 sample mentors
    for i in range(40):
        category = random.choice(categories)
        title = random.choice(titles[category])
        name = random.choice(names)
        
        bookings_count = random.randint(10, 99)
        rating = "5/5"  # All mentors have perfect ratings for simplicity
        
        mentor = {
            'name': name,
            'title': title,
            'rating': rating,
            'bookings': f"{bookings_count}+ bookings",
            'call_type': "1:1 Call",
            'profile_image': f"https://i.pravatar.cc/150?img={i+1}",
            'profile_link': "https://topmate.io/",
            'category': category
        }
        
        sample_mentors.append(mentor)
        names.remove(name)  # Prevent duplicate names
        if not names:  # If we've used all names, reset the list
            names = list(mentor['name'] for mentor in sample_mentors)
    
    # Save sample data to JSON
    with open('mentors.json', 'w', encoding='utf-8') as f:
        json.dump(sample_mentors, f, ensure_ascii=False, indent=4)
    
    print(f"Generated {len(sample_mentors)} sample mentors and saved to mentors.json")
    return sample_mentors

if __name__ == "__main__":
    try:
        mentors = scrape_topmate()
        if not mentors:
            print("Selenium scraping failed. Trying simple method...")
            mentors = scrape_topmate_simple()
            if not mentors:
                print("Both scraping methods failed. Generating sample data...")
                mentors = generate_sample_mentors()
    except Exception as e:
        print(f"Error in main scraping process: {e}")
        print("Generating sample data instead...")
        mentors = generate_sample_mentors()