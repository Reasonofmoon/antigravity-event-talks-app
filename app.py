from flask import Flask, render_template, jsonify, request
import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
import re
from datetime import datetime

app = Flask(__name__)

# In-memory cache for fetched data
cache = {
    "data": None,
    "last_fetched": None
}

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def clean_html_content(soup):
    # Make links inside the content open in a new tab and styled nicely
    for a in soup.find_all('a'):
        a['target'] = '_blank'
        a['rel'] = 'noopener noreferrer'
        a['class'] = 'content-link'
    return str(soup)

def fetch_and_parse_feed():
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        response = requests.get(FEED_URL, headers=headers, timeout=15)
        if response.status_code != 200:
            return None, f"Failed to fetch feed: HTTP {response.status_code}"
        
        # Parse Atom XML feed
        root = ET.fromstring(response.content)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        entries_data = []
        
        for entry in root.findall('atom:entry', ns):
            date_str = entry.find('atom:title', ns).text
            updated_str = entry.find('atom:updated', ns).text
            entry_id = entry.find('atom:id', ns).text
            
            # Get the release note link
            link_elem = entry.find("atom:link[@rel='alternate']", ns)
            if link_elem is None:
                link_elem = entry.find("atom:link", ns)
            link = link_elem.attrib.get('href') if link_elem is not None else ""
            
            content_elem = entry.find('atom:content', ns)
            html_content = content_elem.text if content_elem is not None else ""
            
            # Parse individual items in the content
            soup = BeautifulSoup(html_content, 'html.parser')
            
            items = []
            current_type = "Update"
            current_elements = []
            
            # Iterate through child tags to split updates by headers (e.g. h3 or h2)
            for element in soup.contents:
                if hasattr(element, 'name') and element.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                    if current_elements:
                        temp_soup = BeautifulSoup("", 'html.parser')
                        for el in current_elements:
                            temp_soup.append(el)
                        
                        item_html = clean_html_content(temp_soup)
                        item_text = BeautifulSoup(item_html, 'html.parser').get_text().strip()
                        items.append({
                            "type": current_type,
                            "html": item_html,
                            "text": re.sub(r'\s+', ' ', item_text)
                        })
                        current_elements = []
                    current_type = element.get_text().strip()
                elif element.name or (isinstance(element, str) and element.strip()):
                    current_elements.append(element)
            
            # Handle the last remaining item
            if current_elements:
                temp_soup = BeautifulSoup("", 'html.parser')
                for el in current_elements:
                    temp_soup.append(el)
                
                item_html = clean_html_content(temp_soup)
                item_text = BeautifulSoup(item_html, 'html.parser').get_text().strip()
                items.append({
                    "type": current_type,
                    "html": item_html,
                    "text": re.sub(r'\s+', ' ', item_text)
                })
            
            # Fallback if parsing split didn't yield anything but content exists
            if not items and html_content.strip():
                clean_html = clean_html_content(soup)
                item_text = BeautifulSoup(clean_html, 'html.parser').get_text().strip()
                items.append({
                    "type": "Update",
                    "html": clean_html,
                    "text": re.sub(r'\s+', ' ', item_text)
                })
                
            entries_data.append({
                "date": date_str,
                "updated": updated_str,
                "id": entry_id,
                "link": link,
                "items": items
            })
            
        return entries_data, None
    except Exception as e:
        import traceback
        traceback.print_exc()
        return None, str(e)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes')
def get_notes():
    force_refresh = request.args.get('refresh', 'false').lower() == 'true'
    
    if not force_refresh and cache["data"] is not None:
        return jsonify({
            "success": True,
            "data": cache["data"],
            "last_fetched": cache["last_fetched"],
            "cached": True
        })
        
    data, error = fetch_and_parse_feed()
    if error:
        return jsonify({
            "success": False,
            "error": error
        }), 500
        
    cache["data"] = data
    cache["last_fetched"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return jsonify({
        "success": True,
        "data": data,
        "last_fetched": cache["last_fetched"],
        "cached": False
    })

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
