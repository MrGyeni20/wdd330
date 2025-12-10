const API_KEY = 'CIpSCLAquOsqYEBYnMNS8g==MgKjxSHoGt9zBz2D'; // API KEY
const API_BASE_URL = 'https://api.api-ninjas.com/v1/exercises';
const MAX_RESULTS = 6;

export async function fetchExercises(muscle) {
    try {
        const url = `${API_BASE_URL}?muscle=${encodeURIComponent(muscle)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Api-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
            console.warn('No exercises found for:', muscle);
            return getFallbackExercises(muscle);
        }
        
        return data.slice(0, MAX_RESULTS);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        return getFallbackExercises(muscle);
    }
}

function getFallbackExercises(muscle) {
    const allExercises = {
        biceps: [
            { name: 'Bicep Curls', type: 'strength', difficulty: 'beginner', muscle: 'biceps' },
            { name: 'Hammer Curls', type: 'strength', difficulty: 'beginner', muscle: 'biceps' },
            { name: 'Concentration Curls', type: 'strength', difficulty: 'intermediate', muscle: 'biceps' },
            { name: 'Cable Curls', type: 'strength', difficulty: 'beginner', muscle: 'biceps' }
        ],
        triceps: [
            { name: 'Tricep Dips', type: 'strength', difficulty: 'intermediate', muscle: 'triceps' },
            { name: 'Overhead Extension', type: 'strength', difficulty: 'beginner', muscle: 'triceps' },
            { name: 'Close-Grip Push-ups', type: 'strength', difficulty: 'beginner', muscle: 'triceps' },
            { name: 'Tricep Kickbacks', type: 'strength', difficulty: 'beginner', muscle: 'triceps' }
        ],
        chest: [
            { name: 'Push-ups', type: 'strength', difficulty: 'beginner', muscle: 'chest' },
            { name: 'Bench Press', type: 'strength', difficulty: 'intermediate', muscle: 'chest' },
            { name: 'Chest Flyes', type: 'strength', difficulty: 'beginner', muscle: 'chest' },
            { name: 'Incline Press', type: 'strength', difficulty: 'intermediate', muscle: 'chest' }
        ],
        back: [
            { name: 'Pull-ups', type: 'strength', difficulty: 'intermediate', muscle: 'back' },
            { name: 'Bent-Over Rows', type: 'strength', difficulty: 'intermediate', muscle: 'back' },
            { name: 'Lat Pulldowns', type: 'strength', difficulty: 'beginner', muscle: 'back' },
            { name: 'Deadlifts', type: 'strength', difficulty: 'advanced', muscle: 'back' }
        ],
        legs: [
            { name: 'Squats', type: 'strength', difficulty: 'beginner', muscle: 'legs' },
            { name: 'Lunges', type: 'strength', difficulty: 'beginner', muscle: 'legs' },
            { name: 'Leg Press', type: 'strength', difficulty: 'beginner', muscle: 'legs' },
            { name: 'Calf Raises', type: 'strength', difficulty: 'beginner', muscle: 'legs' }
        ],
        shoulders: [
            { name: 'Shoulder Press', type: 'strength', difficulty: 'beginner', muscle: 'shoulders' },
            { name: 'Lateral Raises', type: 'strength', difficulty: 'beginner', muscle: 'shoulders' },
            { name: 'Front Raises', type: 'strength', difficulty: 'beginner', muscle: 'shoulders' },
            { name: 'Shrugs', type: 'strength', difficulty: 'beginner', muscle: 'shoulders' }
        ],
        abs: [
            { name: 'Crunches', type: 'strength', difficulty: 'beginner', muscle: 'abs' },
            { name: 'Planks', type: 'strength', difficulty: 'beginner', muscle: 'abs' },
            { name: 'Bicycle Crunches', type: 'strength', difficulty: 'beginner', muscle: 'abs' },
            { name: 'Leg Raises', type: 'strength', difficulty: 'intermediate', muscle: 'abs' }
        ]
    };
    
    const muscleLower = muscle.toLowerCase();
    const exercises = allExercises[muscleLower] || allExercises.chest;
    return exercises.slice(0, MAX_RESULTS);
}

export function isApiKeyConfigured() {
    return API_KEY !== 'YOUR_API_KEY_HERE' && API_KEY.length > 0;
}