# BigQuery Release Explorer 🚀

Google Cloud BigQuery의 최신 릴리스 노트를 실시간으로 가져와 시각화하고, 손쉽게 검색 및 필터링하여 X(구 Twitter)로 공유할 수 있는 모던한 웹 애플리케이션입니다. **Python Flask** 백엔드와 **순수 HTML, CSS, JavaScript(Vanilla)** 프론트엔드로 구축되었습니다.

---

## ✨ 주요 기능 (Key Features)

- **자동화된 RSS 피드 파싱:** `https://docs.cloud.google.com/feeds/bigquery-release-notes.xml` RSS 피드를 주기적으로 파싱하여 매일 업데이트되는 릴리스 항목을 개별 카드(Feature, Fixed, Deprecated 등)로 가공하여 보여줍니다.
- **실시간 대시보드 메트릭:** 피드 전체의 업데이트 개수와 기능(Features), 수정 사항(Fixes), 사용 중단(Deprecations) 등 카테고리별 누적 개수를 집계하여 시각화합니다.
- **실시간 검색 및 필터링:** 사용자가 입력하는 키워드에 따라 노트를 즉시 필터링(Fuzzy Search)하며, 상단 카테고리 배지를 클릭해 원하는 유형만 모아볼 수 있습니다.
- **수동 리프레시 및 스켈레톤 로딩:** 리프레시 버튼 클릭 시 회전 애니메이션과 함께 미려한 스켈레톤 카드가 임시 노출되며 백엔드로부터 최신 데이터를 새로 가져옵니다.
- **인터랙티브 트윗 컴포저:** 각 릴리스 노트 카드에서 "Tweet" 버튼을 누르면 커스텀 모달이 열립니다. 트윗 제한 글자수(280자)에 맞춰 원문이 자동으로 요약/재구성되며, 실시간 글자수 카운터 애니메이션 및 클립보드 복사, XIntent 브라우저 새 창 실행을 지원합니다.
- **고급 디자인 시스템:** HSL 기반의 색상 체계와 슬레이트 다크 모드, 카드 호버 스케일 효과, 부드러운 트랜지션 애니메이션 및 커스텀 스크롤바가 적용되어 프리미엄 느낌의 UI를 제공합니다.

---

## 🛠️ 기술 스택 (Technology Stack)

- **Backend:** Python 3.12, Flask, Requests, BeautifulSoup4 (HTML 파서), XML ElementTree (XML 파서)
- **Frontend:** HTML5 (Semantic), Vanilla CSS3 (Custom Variables & Flex/Grid), Vanilla JS (ES6+, Fetch API, DOM Manipulation)

---

## 🚀 실행 방법 (Getting Started)

### 1. 사전 요구사항 (Prerequisites)
- 컴퓨터에 **Python 3.8** 이상 버전이 설치되어 있어야 합니다.

### 2. 패키지 설치 및 실행 (Setup & Run)
터미널에서 프로젝트 루트 폴더(`C:\Users\crescent\agy-cli-projects`)로 이동한 뒤 아래 단계를 실행합니다.

```powershell
# 의존성 패키지 설치 (Flask, requests, beautifulsoup4)
pip install flask requests beautifulsoup4

# Flask 애플리케이션 시작
python app.py
```

### 3. 브라우저 접속
서버가 시작되면 웹 브라우저를 열고 다음 주소로 이동합니다.
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🌐 API 엔드포인트 (API Endpoints)

### 1. 웹 UI 페이지 서빙
*   **Endpoint:** `/`
*   **Method:** `GET`
*   **설명:** 애플리케이션의 메인 사용자 인터페이스 페이지(`index.html`)를 서빙합니다.

### 2. 릴리스 노트 데이터 조회 API
*   **Endpoint:** `/api/notes`
*   **Method:** `GET`
*   **Query Parameters:**
    *   `refresh` (optional): `true`로 설정하면 서버 메모리 캐시를 우회하고 Google Cloud RSS 피드 서버에서 강제로 새로운 데이터를 읽어옵니다. (예: `/api/notes?refresh=true`)
*   **Response Format (JSON):**
    ```json
    {
      "success": true,
      "cached": false,
      "last_fetched": "2026-06-16 12:31:28",
      "data": [
        {
          "date": "June 15, 2026",
          "id": "tag:google.com,2016:bigquery-release-notes#June_15_2026",
          "link": "https://docs.cloud.google.com/bigquery/docs/release-notes#June_15_2026",
          "updated": "2026-06-15T00:00:00-07:00",
          "items": [
            {
              "type": "Feature",
              "html": "<p>Use Gemini Cloud Assist to analyze your SQL queries...</p>",
              "text": "Use Gemini Cloud Assist to analyze your SQL queries..."
            }
          ]
        }
      ]
    }
    ```

---

## 📂 프로젝트 구조 (Project Structure)

- `app.py`: Flask 백엔드 로직 및 XML/HTML 데이터 가공 파서
- `templates/`: HTML 템플릿 폴더
  - `index.html`: 메인 대시보드 레이아웃 및 트윗 모달 컴포넌트
- `static/`: 프론트엔드 정적 리소스 폴더
  - `css/style.css`: 테마 토큰 변수, 반응형 레이아웃, 트랜지션 애니메이션 정의
  - `js/app.js`: 데이터 페칭, 클라이언트 필터링/검색, 실시간 모달 글자수 링 제어
- `Documents/`: 뉴스 텍스트 및 서머리 기록 보관 폴더
  - `news.txt`: 수집된 최신 세계 뉴스 원본
  - `summary.txt`: 수집된 뉴스 요약본
- `.gitignore`: Git 버전 관리 제외 설정 파일
