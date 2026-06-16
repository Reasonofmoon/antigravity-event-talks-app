# BigQuery Release Explorer 🚀

A sleek, modern web application that fetches, parses, and displays Google Cloud BigQuery Release Notes, with interactive features to filter, search, and share updates on X (formerly Twitter).

---

## ✨ Features

- **Automated RSS XML Parsing:** Automatically fetches and splits daily Google Cloud BigQuery release updates into distinct item cards (Features, Fixes, Deprecations, and Changes).
*   **Real-time Dashboard Metrics:** High-level metrics tracking the total count of updates, features, fixes, and deprecations available in the current feed.
- **Dynamic Search & Filtering:** Instantly search updates as you type or filter them by clicking category badges.
- **Refresh Spinner & Skeleton Loading:** Manually trigger feed updates with smooth transition animations and skeleton loading placeholders.
- **Interactive Tweet Composer:** Select any release note to draft a tweet with a dynamic character progress ring, clipboard copy button, and single-click Twitter Web Intent redirection.
- **Rich Aesthetics:** A responsive slate dark theme built with CSS variables, modern custom scrollbars, and card micro-interactions.

---

## 🛠️ Technology Stack

- **Backend:** Python Flask, Requests, BeautifulSoup4, XML ElementTree
- **Frontend:** Plain HTML5, Vanilla CSS3 (Custom properties/variables), ES6 JavaScript

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher installed.

### Setup & Run
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Reasonofmoon/antigravity-event-talks-app.git
   cd antigravity-event-talks-app
   ```

2. **Install dependencies:**
   ```bash
   pip install flask requests beautifulsoup4
   ```

3. **Start the Flask server:**
   ```bash
   python app.py
   ```

4. **Open in browser:**
   Navigate to [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 📂 Project Structure

- `app.py`: The Flask server and feed parser.
- `templates/`: Folder containing HTML layout template.
  - `index.html`: Main page structure and modal dialog markup.
- `static/`: Frontend assets.
  - `css/style.css`: Theme variables, grid layout, animations, and modal stylings.
  - `js/app.js`: State handling, API consumption, search filter, character count, and interactive behaviors.
- `news.txt`: Workspace record of raw fetched news headlines.
- `summary.txt`: Workspace record of compiled news summary.
