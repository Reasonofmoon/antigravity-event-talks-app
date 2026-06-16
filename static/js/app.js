// State Management
let releaseNotes = []; // Raw parsed feed data
let activeFilter = 'all';
let searchQuery = '';

// DOM Elements
const feedContainer = document.getElementById('feed-container');
const btnRefresh = document.getElementById('btn-refresh');
const lastUpdatedLabel = document.getElementById('last-updated-label');
const searchInput = document.getElementById('search-input');
const btnClearSearch = document.getElementById('btn-clear-search');
const filterBadges = document.querySelectorAll('.filter-badge');

// Stats Counters
const statTotal = document.getElementById('stat-total');
const statFeatures = document.getElementById('stat-features');
const statFixes = document.getElementById('stat-fixes');
const statDeprecations = document.getElementById('stat-deprecations');

// Tweet Composer Modal Elements
const tweetModal = document.getElementById('tweet-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const tweetTextarea = document.getElementById('tweet-textarea');
const charCount = document.getElementById('char-count');
const progressCircle = document.getElementById('progress-circle');
const btnCopyTweet = document.getElementById('btn-copy-tweet');
const btnPublishTweet = document.getElementById('btn-publish-tweet');
const composerDate = document.getElementById('composer-date');
const composerBadge = document.getElementById('composer-badge');

// Progress Ring Configuration
const circleRadius = 14;
const circumference = 2 * Math.PI * circleRadius;

// Initialize Progress Ring
if (progressCircle) {
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;
}

/* --- API Requests & Data Load --- */
async function fetchReleaseNotes(forceRefresh = false) {
    try {
        setLoadingState(true);
        const url = forceRefresh ? '/api/notes?refresh=true' : '/api/notes';
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            releaseNotes = result.data;
            lastUpdatedLabel.textContent = `Last fetched: ${result.last_fetched.split(' ')[1]}`;
            updateStats();
            renderFeed();
            if (forceRefresh) {
                showToast("Feed refreshed successfully!", "success");
            }
        } else {
            showToast(`Error: ${result.error}`, "error");
            renderErrorState(result.error);
        }
    } catch (err) {
        showToast(`Connection failed: ${err.message}`, "error");
        renderErrorState(err.message);
    } finally {
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    if (isLoading) {
        btnRefresh.classList.add('loading');
        btnRefresh.disabled = true;
        
        // Show skeleton loaders
        feedContainer.innerHTML = `
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        `;
    } else {
        btnRefresh.classList.remove('loading');
        btnRefresh.disabled = false;
    }
}

/* --- Normalization Helpers --- */
function normalizeType(typeStr) {
    const type = typeStr.toLowerCase().trim();
    if (type.includes('feature') || type.includes('new')) return 'feature';
    if (type.includes('fix') || type.includes('resolved') || type.includes('security') || type.includes('issue')) return 'fixed';
    if (type.includes('deprecat')) return 'deprecated';
    if (type.includes('change') || type.includes('modify')) return 'changed';
    return 'other';
}

function getBadgeClass(normalizedType) {
    switch (normalizedType) {
        case 'feature': return 'badge-feature';
        case 'fixed': return 'badge-fixed';
        case 'deprecated': return 'badge-deprecated';
        case 'changed': return 'badge-changed';
        default: return 'badge-other';
    }
}

function getCardColorVar(normalizedType) {
    switch (normalizedType) {
        case 'feature': return 'var(--color-feature)';
        case 'fixed': return 'var(--color-fixed)';
        case 'deprecated': return 'var(--color-deprecated)';
        case 'changed': return 'var(--color-changed)';
        default: return 'var(--color-other)';
    }
}

/* --- Stats Calculation --- */
function updateStats() {
    let total = 0;
    let features = 0;
    let fixes = 0;
    let deprecations = 0;

    releaseNotes.forEach(entry => {
        entry.items.forEach(item => {
            total++;
            const norm = normalizeType(item.type);
            if (norm === 'feature') features++;
            else if (norm === 'fixed') fixes++;
            else if (norm === 'deprecated') deprecations++;
        });
    });

    statTotal.textContent = total;
    statFeatures.textContent = features;
    statFixes.textContent = fixes;
    statDeprecations.textContent = deprecations;
}

/* --- Feed Rendering & Filtering --- */
function renderFeed() {
    feedContainer.innerHTML = '';
    let filteredCount = 0;

    releaseNotes.forEach(entry => {
        // Filter and compile items
        const matchingItems = entry.items.filter(item => {
            const normType = normalizeType(item.type);
            
            // Apply category filter
            if (activeFilter !== 'all' && normType !== activeFilter) {
                return false;
            }
            
            // Apply search query filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesText = item.text.toLowerCase().includes(query);
                const matchesType = item.type.toLowerCase().includes(query);
                const matchesDate = entry.date.toLowerCase().includes(query);
                return matchesText || matchesType || matchesDate;
            }
            
            return true;
        });

        // If there are matching items, render a card for each
        matchingItems.forEach((item, index) => {
            filteredCount++;
            const normType = normalizeType(item.type);
            const badgeClass = getBadgeClass(normType);
            const borderCol = getCardColorVar(normType);

            const card = document.createElement('article');
            card.className = 'note-card';
            card.style.setProperty('--badge-color', borderCol);
            
            // Generate distinct content id
            const contentId = `${entry.id}_${index}`;

            card.innerHTML = `
                <div class="card-header">
                    <div class="card-date-group">
                        <svg class="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span class="card-date">${entry.date}</span>
                    </div>
                    <span class="badge ${badgeClass}">${item.type}</span>
                </div>
                <div class="card-body">
                    ${item.html}
                </div>
                <div class="card-footer">
                    <a href="${entry.link}" class="btn-card-link" target="_blank" rel="noopener noreferrer">
                        <span>Official Docs</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                    <button class="btn btn-secondary btn-tweet" onclick="openTweetComposer('${entry.date}', '${item.type}', '${encodeURIComponent(item.text)}', '${entry.link}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span>Tweet</span>
                    </button>
                </div>
            `;
            feedContainer.appendChild(card);
        });
    });

    if (filteredCount === 0) {
        renderEmptyState();
    }
}

function renderEmptyState() {
    feedContainer.innerHTML = `
        <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3>No release notes match your query</h3>
            <p>Try clearing your search or selecting a different category filter.</p>
        </div>
    `;
}

function renderErrorState(errorMsg) {
    feedContainer.innerHTML = `
        <div class="empty-state" style="border-color: var(--color-deprecated-border);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="1.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h3 class="text-orange">Failed to load release notes</h3>
            <p>${errorMsg}</p>
            <button class="btn btn-primary" style="margin-top: 1rem;" onclick="fetchReleaseNotes(true)">Try Again</button>
        </div>
    `;
}

/* --- Tweet Composer Modal Logic --- */
window.openTweetComposer = function(date, type, encodedText, docLink) {
    const text = decodeURIComponent(encodedText);
    
    // Set source metadata on modal
    composerDate.textContent = date;
    composerBadge.textContent = type;
    
    // Reset classes
    composerBadge.className = 'source-badge ' + getBadgeClass(normalizeType(type));

    // Construct high-quality draft tweet
    const hashtags = "\n#GoogleCloud #BigQuery";
    const prefix = `📢 BigQuery ${type} (${date}): `;
    const link = `\n\nDocs: ${docLink}`;
    
    // 280 character limit handling
    const maxBodyLen = 280 - prefix.length - hashtags.length - link.length - 3;
    let draftBody = text;
    if (draftBody.length > maxBodyLen) {
        draftBody = draftBody.substring(0, maxBodyLen) + "...";
    }

    const draftText = `${prefix}${draftBody}${link}${hashtags}`;
    
    // Populate modal textarea
    tweetTextarea.value = draftText;
    updateCharCount();
    
    // Open modal
    tweetModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
};

function closeTweetComposer() {
    tweetModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore background scroll
}

function updateCharCount() {
    const text = tweetTextarea.value;
    const chars = text.length;
    const remaining = 280 - chars;
    
    charCount.textContent = remaining;
    
    // Update Progress Ring
    const limit = 280;
    const percent = Math.min(chars / limit, 1);
    const offset = circumference - (percent * circumference);
    
    progressCircle.style.strokeDashoffset = offset;
    
    // Color states based on character usage
    if (chars >= limit) {
        progressCircle.style.stroke = "#ef4444"; // Red (Exceeded)
        charCount.style.color = "#ef4444";
    } else if (chars >= limit - 20) {
        progressCircle.style.stroke = "#f59e0b"; // Yellow (Warning)
        charCount.style.color = "#f59e0b";
    } else {
        progressCircle.style.stroke = "#3b82f6"; // Blue (Good)
        charCount.style.color = "var(--text-secondary)";
    }
}

// Actions inside Tweet Modal
async function copyTweetDraft() {
    try {
        await navigator.clipboard.writeText(tweetTextarea.value);
        showToast("Draft copied to clipboard!", "success");
    } catch (err) {
        showToast("Failed to copy text", "error");
    }
}

function publishTweet() {
    const text = tweetTextarea.value;
    if (text.length > 280) {
        showToast("Tweet exceeds the 280 character limit!", "error");
        return;
    }
    const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterIntentUrl, '_blank', 'noopener,noreferrer');
}

/* --- UI Helpers (Toast notifications) --- */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>` : 
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Trigger transition
    setTimeout(() => toast.classList.add('show'), 50);
    
    // Remove toast after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/* --- Event Listeners Setup --- */
function setupEventListeners() {
    // Refresh Button Click
    btnRefresh.addEventListener('click', () => fetchReleaseNotes(true));
    
    // Search Box Input (Filter as you type)
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchQuery) {
            btnClearSearch.style.display = 'block';
        } else {
            btnClearSearch.style.display = 'none';
        }
        renderFeed();
    });
    
    // Clear Search Click
    btnClearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        btnClearSearch.style.display = 'none';
        renderFeed();
        searchInput.focus();
    });
    
    // Filter Badges Clicks
    filterBadges.forEach(badge => {
        badge.addEventListener('click', () => {
            filterBadges.forEach(b => b.classList.remove('active'));
            badge.classList.add('active');
            activeFilter = badge.getAttribute('data-filter');
            renderFeed();
        });
    });
    
    // Modal Listeners
    btnCloseModal.addEventListener('click', closeTweetComposer);
    
    // Close modal if user clicks backdrop
    tweetModal.addEventListener('click', (e) => {
        if (e.target === tweetModal) {
            closeTweetComposer();
        }
    });

    // Keyboard support for modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && tweetModal.classList.contains('active')) {
            closeTweetComposer();
        }
    });
    
    // Tweet Textarea Event Listener
    tweetTextarea.addEventListener('input', updateCharCount);
    
    // Action buttons in modal
    btnCopyTweet.addEventListener('click', copyTweetDraft);
    btnPublishTweet.addEventListener('click', publishTweet);
}

// Initial Run
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    fetchReleaseNotes(false);
});
