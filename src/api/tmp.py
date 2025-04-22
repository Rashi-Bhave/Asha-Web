import requests

url = "https://jsearch.p.rapidapi.com/estimated-salary"

querystring = {
    "job_title": "software engineer",
    "location": "bangalore",
    "location_type": "ANY",
    "years_of_experience": "ALL"
}

headers = {
    "x-rapidapi-host": "jsearch.p.rapidapi.com",
    "x-rapidapi-key": "d74d0dd574mshdff9d071b829b95p1201bcjsn0003797587f6"
}

response = requests.get(url, headers=headers, params=querystring)

if response.status_code == 200:
    data = response.json()
    print(data)
else:
    print(f"Request failed with status code {response.status_code}: {response.text}")