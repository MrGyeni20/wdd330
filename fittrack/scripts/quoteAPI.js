const QUOTE_TAGS = 'inspirational';
const API_BASE_URL = 'https://api.quotable.io';

export async function fetchQuote() {
    try {
        const url = `${API_BASE_URL}/random?tags=${QUOTE_TAGS}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            text: data.content,
            author: data.author
        };
    } catch (error) {
        console.error('Error fetching quote:', error);
        return getFallbackQuote();
    }
}

function getFallbackQuote() {
    const fallbackQuotes = [
        { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
        { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
        { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
        { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
        { text: "The difference between try and triumph is a little umph.", author: "Unknown" },
        { text: "Strength doesn't come from what you can do. It comes from overcoming the things you thought you couldn't.", author: "Rikki Rogers" },
        { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
        { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
        { text: "Push yourself because no one else is going to do it for you.", author: "Unknown" },
        { text: "You don't have to be extreme, just consistent.", author: "Unknown" }
    ];
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    return fallbackQuotes[randomIndex];
} 