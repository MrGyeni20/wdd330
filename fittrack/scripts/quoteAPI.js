// ============================================
// QUOTE API - QUOTABLE.IO INTEGRATION
// ============================================

const QUOTE_TAGS = 'inspirational,motivational,sports,wisdom';
const API_BASE_URL = 'https://api.quotable.io';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const MAX_RETRIES = 3;

// Simple in-memory cache
let cachedQuote = null;
let cacheTimestamp = null;
let lastFetchedQuotes = [];

// ============================================
// MAIN FETCH FUNCTION
// ============================================

export async function fetchQuote(forceRefresh = false) {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
        const cached = getCachedQuote();
        if (cached) {
            console.log('✅ Using cached quote');
            return cached;
        }
    }
    
    let attempts = 0;
    
    while (attempts < MAX_RETRIES) {
        try {
            console.log(`🔍 Fetching new quote (attempt ${attempts + 1}/${MAX_RETRIES})`);
            
            // Build URL with tags
            const url = `${API_BASE_URL}/random?tags=${QUOTE_TAGS}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                // Add timeout
                signal: AbortSignal.timeout(8000) // 8 second timeout
            });
            
            // Check response status
            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }
            
            // Parse JSON
            const data = await response.json();
            
            // Validate response
            if (!data || !data.content || !data.author) {
                throw new Error('Invalid API response format');
            }
            
            // Create quote object
            const quote = {
                text: data.content,
                author: data.author,
                tags: data.tags || [],
                length: data.length || data.content.length,
                id: data._id || Date.now().toString(),
                timestamp: Date.now()
            };
            
            // Avoid duplicate quotes
            if (isQuoteDuplicate(quote)) {
                console.log('⚠️ Duplicate quote detected, fetching another...');
                attempts++;
                continue;
            }
            
            // Cache the quote
            cacheQuote(quote);
            
            // Add to history
            addToQuoteHistory(quote);
            
            console.log('✅ Quote fetched successfully');
            return quote;
            
        } catch (error) {
            attempts++;
            
            // Handle different error types
            if (error.name === 'AbortError') {
                console.error(`❌ Request timeout (attempt ${attempts}/${MAX_RETRIES})`);
            } else if (error.name === 'TypeError') {
                console.error(`❌ Network error (attempt ${attempts}/${MAX_RETRIES})`);
            } else {
                console.error(`❌ Error fetching quote (attempt ${attempts}/${MAX_RETRIES}):`, error.message);
            }
            
            // Wait before retry (exponential backoff)
            if (attempts < MAX_RETRIES) {
                await delay(1000 * attempts);
            }
        }
    }
    
    // All retries failed, return fallback
    console.warn('⚠️ All API attempts failed, using fallback quote');
    return getFallbackQuote();
}

// ============================================
// SPECIALIZED QUOTE FETCHERS
// ============================================

export async function fetchQuoteByTag(tag) {
    try {
        const url = `${API_BASE_URL}/random?tags=${encodeURIComponent(tag)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            text: data.content,
            author: data.author,
            tags: data.tags || [tag],
            timestamp: Date.now()
        };
    } catch (error) {
        console.error('Error fetching quote by tag:', error);
        return getFallbackQuoteByTag(tag);
    }
}

export async function fetchQuoteByAuthor(author) {
    try {
        const url = `${API_BASE_URL}/random?author=${encodeURIComponent(author)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            text: data.content,
            author: data.author,
            timestamp: Date.now()
        };
    } catch (error) {
        console.error('Error fetching quote by author:', error);
        return getFallbackQuote();
    }
}

export async function fetchQuoteOfTheDay() {
    try {
        // Check if we already have today's quote cached
        const todayKey = new Date().toDateString();
        const cached = localStorage.getItem(`qotd_${todayKey}`);
        
        if (cached) {
            return JSON.parse(cached);
        }
        
        const url = `${API_BASE_URL}/random?tags=inspirational`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        const quote = {
            text: data.content,
            author: data.author,
            timestamp: Date.now(),
            isQuoteOfTheDay: true
        };
        
        // Cache for the day
        localStorage.setItem(`qotd_${todayKey}`, JSON.stringify(quote));
        
        return quote;
    } catch (error) {
        console.error('Error fetching quote of the day:', error);
        return getFallbackQuote();
    }
}

// ============================================
// CACHE MANAGEMENT
// ============================================

function getCachedQuote() {
    if (!cachedQuote || !cacheTimestamp) {
        return null;
    }
    
    const now = Date.now();
    if (now - cacheTimestamp > CACHE_DURATION) {
        cachedQuote = null;
        cacheTimestamp = null;
        return null;
    }
    
    return cachedQuote;
}

function cacheQuote(quote) {
    cachedQuote = quote;
    cacheTimestamp = Date.now();
}

export function clearQuoteCache() {
    cachedQuote = null;
    cacheTimestamp = null;
    lastFetchedQuotes = [];
    console.log('✅ Quote cache cleared');
}

// ============================================
// QUOTE HISTORY
// ============================================

function addToQuoteHistory(quote) {
    lastFetchedQuotes.unshift(quote);
    
    // Keep only last 10 quotes
    if (lastFetchedQuotes.length > 10) {
        lastFetchedQuotes = lastFetchedQuotes.slice(0, 10);
    }
}

function isQuoteDuplicate(quote) {
    // Check if we've seen this quote in recent history
    return lastFetchedQuotes.some(q => 
        q.text === quote.text || q.id === quote.id
    );
}

export function getQuoteHistory() {
    return [...lastFetchedQuotes];
}

// ============================================
// FALLBACK QUOTES DATABASE
// ============================================

function getFallbackQuote() {
    console.log('📦 Using fallback quote');
    
    const fallbackQuotes = [
        { 
            text: "The only bad workout is the one that didn't happen.", 
            author: "Unknown",
            tags: ['fitness', 'motivational']
        },
        { 
            text: "Success is the sum of small efforts repeated day in and day out.", 
            author: "Robert Collier",
            tags: ['success', 'inspirational']
        },
        { 
            text: "Don't stop when you're tired. Stop when you're done.", 
            author: "Unknown",
            tags: ['motivational', 'perseverance']
        },
        { 
            text: "Your body can stand almost anything. It's your mind you have to convince.", 
            author: "Unknown",
            tags: ['fitness', 'mental-strength']
        },
        { 
            text: "The difference between try and triumph is a little umph.", 
            author: "Unknown",
            tags: ['motivational', 'success']
        },
        { 
            text: "Strength doesn't come from what you can do. It comes from overcoming the things you thought you couldn't.", 
            author: "Rikki Rogers",
            tags: ['strength', 'inspirational']
        },
        { 
            text: "The pain you feel today will be the strength you feel tomorrow.", 
            author: "Unknown",
            tags: ['fitness', 'perseverance']
        },
        { 
            text: "Take care of your body. It's the only place you have to live.", 
            author: "Jim Rohn",
            tags: ['health', 'wisdom']
        },
        { 
            text: "Push yourself because no one else is going to do it for you.", 
            author: "Unknown",
            tags: ['motivational', 'self-improvement']
        },
        { 
            text: "You don't have to be extreme, just consistent.", 
            author: "Unknown",
            tags: ['consistency', 'wisdom']
        },
        { 
            text: "The only way to do great work is to love what you do.", 
            author: "Steve Jobs",
            tags: ['inspirational', 'success']
        },
        { 
            text: "Believe you can and you're halfway there.", 
            author: "Theodore Roosevelt",
            tags: ['belief', 'inspirational']
        },
        { 
            text: "It's not about having time. It's about making time.", 
            author: "Unknown",
            tags: ['time-management', 'motivational']
        },
        { 
            text: "Sweat is fat crying.", 
            author: "Unknown",
            tags: ['fitness', 'humor']
        },
        { 
            text: "The body achieves what the mind believes.", 
            author: "Unknown",
            tags: ['mindset', 'fitness']
        },
        { 
            text: "Fitness is not about being better than someone else. It's about being better than you used to be.", 
            author: "Khloe Kardashian",
            tags: ['self-improvement', 'fitness']
        },
        { 
            text: "The only person you should try to be better than is the person you were yesterday.", 
            author: "Unknown",
            tags: ['self-improvement', 'wisdom']
        },
        { 
            text: "Your health is an investment, not an expense.", 
            author: "Unknown",
            tags: ['health', 'wisdom']
        },
        { 
            text: "Rome wasn't built in a day, but they worked on it every single day.", 
            author: "Unknown",
            tags: ['consistency', 'perseverance']
        },
        { 
            text: "A one-hour workout is 4% of your day. No excuses.", 
            author: "Unknown",
            tags: ['fitness', 'time-management']
        }
    ];
    
    // Select a random quote, avoiding recent duplicates
    let selectedQuote;
    let attempts = 0;
    const maxAttempts = 5;
    
    do {
        const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
        selectedQuote = fallbackQuotes[randomIndex];
        attempts++;
    } while (isQuoteDuplicate(selectedQuote) && attempts < maxAttempts);
    
    // Add timestamp
    const quote = {
        ...selectedQuote,
        timestamp: Date.now(),
        isFallback: true
    };
    
    // Add to history
    addToQuoteHistory(quote);
    
    return quote;
}

function getFallbackQuoteByTag(tag) {
    const tagLower = tag.toLowerCase();
    const fallbackQuotes = getFallbackQuote();
    
    // This is simplified - in real implementation, filter by tag
    return fallbackQuotes;
}

// ============================================
// API STATUS & UTILITIES
// ============================================

export async function checkApiStatus() {
    try {
        const response = await fetch(API_BASE_URL, {
            signal: AbortSignal.timeout(5000)
        });
        
        return {
            online: response.ok,
            status: response.status,
            timestamp: Date.now()
        };
    } catch (error) {
        return {
            online: false,
            error: error.message,
            timestamp: Date.now()
        };
    }
}

export function getApiInfo() {
    return {
        baseUrl: API_BASE_URL,
        tags: QUOTE_TAGS.split(','),
        cacheDuration: CACHE_DURATION,
        maxRetries: MAX_RETRIES,
        cacheStatus: cachedQuote ? 'Active' : 'Empty',
        historySize: lastFetchedQuotes.length
    };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// AVAILABLE TAGS
// ============================================

export function getAvailableTags() {
    return [
        'inspirational',
        'motivational',
        'sports',
        'wisdom',
        'success',
        'perseverance',
        'fitness',
        'health',
        'life',
        'happiness',
        'courage',
        'change',
        'leadership',
        'strength'
    ];
}

// ============================================
// RANDOM MOTIVATIONAL FACT
// ============================================

export function getMotivationalFact() {
    const facts = [
        "Regular exercise can increase your lifespan by up to 7 years.",
        "Just 30 minutes of exercise can boost your mood for up to 12 hours.",
        "Strength training can reverse age-related muscle loss.",
        "Exercise is as effective as medication for treating mild depression.",
        "Working out in the morning can increase productivity by 23%.",
        "Regular exercise improves memory and thinking skills.",
        "Physical activity reduces the risk of chronic disease by up to 50%.",
        "Exercise releases endorphins, your body's natural mood lifters.",
        "Consistent workouts improve sleep quality by up to 65%.",
        "Just 10 minutes of exercise can improve concentration."
    ];
    
    return facts[Math.floor(Math.random() * facts.length)];
}

// ============================================
// EXPORT MODULE INFO
// ============================================

console.log('✅ Quote API module loaded');
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🏷️ Tags:', QUOTE_TAGS);