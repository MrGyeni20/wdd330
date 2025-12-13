// ============================================
// EXERCISE API - API NINJAS INTEGRATION
// ============================================

const API_KEY = 'CIpSCLAquOsqYEBYnMNS8g==MgKjxSHoGt9zBz2D';
const API_BASE_URL = 'https://api.api-ninjas.com/v1/exercises';
const MAX_RESULTS = 6;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Simple in-memory cache to reduce API calls
const exerciseCache = new Map();

// ============================================
// MAIN FETCH FUNCTION
// ============================================

export async function fetchExercises(muscle) {
    if (!muscle || typeof muscle !== 'string') {
        console.error('❌ Invalid muscle parameter');
        return getFallbackExercises('chest');
    }
    
    const muscleLower = muscle.toLowerCase().trim();
    
    // Check cache first
    const cached = getCachedExercises(muscleLower);
    if (cached) {
        console.log('✅ Using cached exercises for:', muscleLower);
        return cached;
    }
    
    try {
        console.log('🔍 Fetching exercises for:', muscleLower);
        
        const url = `${API_BASE_URL}?muscle=${encodeURIComponent(muscleLower)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Api-Key': API_KEY,
                'Content-Type': 'application/json'
            },
            // Add timeout using AbortController
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        // Check response status
        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }
        
        // Parse JSON response
        const data = await response.json();
        
        // Validate response data
        if (!Array.isArray(data)) {
            throw new Error('Invalid API response format');
        }
        
        // Check if we got results
        if (data.length === 0) {
            console.warn('⚠️ No exercises found for:', muscleLower);
            return getFallbackExercises(muscleLower);
        }
        
        // Process and limit results
        const exercises = data.slice(0, MAX_RESULTS).map(exercise => ({
            name: exercise.name || 'Unknown Exercise',
            type: exercise.type || 'strength',
            difficulty: exercise.difficulty || 'beginner',
            muscle: exercise.muscle || muscleLower,
            equipment: exercise.equipment || 'none',
            instructions: exercise.instructions || 'No instructions available'
        }));
        
        // Cache the results
        cacheExercises(muscleLower, exercises);
        
        console.log(`✅ Fetched ${exercises.length} exercises for ${muscleLower}`);
        return exercises;
        
    } catch (error) {
        // Handle different types of errors
        if (error.name === 'AbortError') {
            console.error('❌ Request timeout - API took too long to respond');
        } else if (error.name === 'TypeError') {
            console.error('❌ Network error - Check internet connection');
        } else {
            console.error('❌ Error fetching exercises:', error.message);
        }
        
        // Return fallback exercises on error
        return getFallbackExercises(muscleLower);
    }
}

// ============================================
// CACHE MANAGEMENT
// ============================================

function getCachedExercises(muscle) {
    const cached = exerciseCache.get(muscle);
    
    if (!cached) {
        return null;
    }
    
    // Check if cache is still valid
    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
        exerciseCache.delete(muscle);
        return null;
    }
    
    return cached.data;
}

function cacheExercises(muscle, exercises) {
    exerciseCache.set(muscle, {
        data: exercises,
        timestamp: Date.now()
    });
}

export function clearExerciseCache() {
    exerciseCache.clear();
    console.log('✅ Exercise cache cleared');
}

// ============================================
// FALLBACK EXERCISES DATABASE
// ============================================

function getFallbackExercises(muscle) {
    console.log('📦 Using fallback exercises for:', muscle);
    
    const allExercises = {
        biceps: [
            { 
                name: 'Bicep Curls', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'biceps',
                equipment: 'dumbbells',
                instructions: 'Stand with feet shoulder-width apart, curl dumbbells up to shoulders'
            },
            { 
                name: 'Hammer Curls', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'biceps',
                equipment: 'dumbbells',
                instructions: 'Hold dumbbells with neutral grip, curl up keeping wrists straight'
            },
            { 
                name: 'Concentration Curls', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'biceps',
                equipment: 'dumbbell',
                instructions: 'Sit down, rest elbow on inner thigh, curl dumbbell up'
            },
            { 
                name: 'Cable Curls', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'biceps',
                equipment: 'cable machine',
                instructions: 'Attach straight bar to low pulley, curl up keeping elbows stationary'
            },
            { 
                name: 'Preacher Curls', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'biceps',
                equipment: 'preacher bench',
                instructions: 'Rest arms on preacher bench, curl bar up slowly'
            },
            { 
                name: 'Chin-ups', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'biceps',
                equipment: 'pull-up bar',
                instructions: 'Grip bar with palms facing you, pull yourself up until chin clears bar'
            }
        ],
        triceps: [
            { 
                name: 'Tricep Dips', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'triceps',
                equipment: 'dip bars',
                instructions: 'Lower body by bending elbows, push back up to starting position'
            },
            { 
                name: 'Overhead Extension', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'triceps',
                equipment: 'dumbbell',
                instructions: 'Hold dumbbell overhead, lower behind head, extend back up'
            },
            { 
                name: 'Close-Grip Push-ups', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'triceps',
                equipment: 'body weight',
                instructions: 'Place hands close together, lower body keeping elbows close to sides'
            },
            { 
                name: 'Tricep Kickbacks', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'triceps',
                equipment: 'dumbbells',
                instructions: 'Bend forward, extend arm back keeping upper arm stationary'
            },
            { 
                name: 'Skull Crushers', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'triceps',
                equipment: 'barbell',
                instructions: 'Lie on bench, lower bar to forehead, extend back up'
            },
            { 
                name: 'Diamond Push-ups', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'triceps',
                equipment: 'body weight',
                instructions: 'Form diamond with hands, perform push-ups'
            }
        ],
        chest: [
            { 
                name: 'Push-ups', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'chest',
                equipment: 'body weight',
                instructions: 'Lower body until chest nearly touches floor, push back up'
            },
            { 
                name: 'Bench Press', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'chest',
                equipment: 'barbell',
                instructions: 'Lower bar to chest, press up until arms are extended'
            },
            { 
                name: 'Chest Flyes', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'chest',
                equipment: 'dumbbells',
                instructions: 'Lie on bench, lower dumbbells out to sides, bring back together'
            },
            { 
                name: 'Incline Press', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'chest',
                equipment: 'barbell',
                instructions: 'On incline bench, press bar up from upper chest'
            },
            { 
                name: 'Cable Crossover', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'chest',
                equipment: 'cable machine',
                instructions: 'Stand between cables, bring handles together in front of chest'
            },
            { 
                name: 'Dumbbell Press', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'chest',
                equipment: 'dumbbells',
                instructions: 'Lie on bench, press dumbbells up until arms extended'
            }
        ],
        back: [
            { 
                name: 'Pull-ups', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'back',
                equipment: 'pull-up bar',
                instructions: 'Grip bar with palms away, pull up until chin clears bar'
            },
            { 
                name: 'Bent-Over Rows', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'back',
                equipment: 'barbell',
                instructions: 'Bend forward, pull bar to lower chest, lower with control'
            },
            { 
                name: 'Lat Pulldowns', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'back',
                equipment: 'cable machine',
                instructions: 'Pull bar down to upper chest, return with control'
            },
            { 
                name: 'Deadlifts', 
                type: 'strength', 
                difficulty: 'advanced', 
                muscle: 'back',
                equipment: 'barbell',
                instructions: 'Lift bar from ground to standing position keeping back straight'
            },
            { 
                name: 'T-Bar Rows', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'back',
                equipment: 't-bar',
                instructions: 'Pull bar to chest while maintaining bent-over position'
            },
            { 
                name: 'Face Pulls', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'back',
                equipment: 'cable machine',
                instructions: 'Pull rope attachment towards face, spreading hands apart'
            }
        ],
        legs: [
            { 
                name: 'Squats', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'legs',
                equipment: 'barbell',
                instructions: 'Lower body as if sitting back into chair, push back up through heels'
            },
            { 
                name: 'Lunges', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'legs',
                equipment: 'body weight',
                instructions: 'Step forward, lower back knee towards ground, push back to start'
            },
            { 
                name: 'Leg Press', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'legs',
                equipment: 'machine',
                instructions: 'Push platform away with feet, lower with control'
            },
            { 
                name: 'Calf Raises', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'legs',
                equipment: 'body weight',
                instructions: 'Raise up onto toes, lower back down with control'
            },
            { 
                name: 'Romanian Deadlifts', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'legs',
                equipment: 'barbell',
                instructions: 'Lower bar along legs keeping back straight, feel stretch in hamstrings'
            },
            { 
                name: 'Leg Curls', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'legs',
                equipment: 'machine',
                instructions: 'Curl legs up towards glutes, lower with control'
            }
        ],
        shoulders: [
            { 
                name: 'Shoulder Press', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'shoulders',
                equipment: 'dumbbells',
                instructions: 'Press dumbbells overhead until arms fully extended'
            },
            { 
                name: 'Lateral Raises', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'shoulders',
                equipment: 'dumbbells',
                instructions: 'Raise dumbbells out to sides until parallel with ground'
            },
            { 
                name: 'Front Raises', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'shoulders',
                equipment: 'dumbbells',
                instructions: 'Raise dumbbells in front to shoulder height'
            },
            { 
                name: 'Shrugs', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'shoulders',
                equipment: 'dumbbells',
                instructions: 'Raise shoulders up towards ears, lower with control'
            },
            { 
                name: 'Arnold Press', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'shoulders',
                equipment: 'dumbbells',
                instructions: 'Start with palms facing you, rotate and press overhead'
            },
            { 
                name: 'Upright Rows', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'shoulders',
                equipment: 'barbell',
                instructions: 'Pull bar up along body to chin height, lower with control'
            }
        ],
        abs: [
            { 
                name: 'Crunches', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'abs',
                equipment: 'body weight',
                instructions: 'Lift shoulders off ground, contract abs, lower with control'
            },
            { 
                name: 'Planks', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'abs',
                equipment: 'body weight',
                instructions: 'Hold body in straight line from head to heels'
            },
            { 
                name: 'Bicycle Crunches', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'abs',
                equipment: 'body weight',
                instructions: 'Alternate bringing opposite elbow to knee in cycling motion'
            },
            { 
                name: 'Leg Raises', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'abs',
                equipment: 'body weight',
                instructions: 'Raise legs up while lying on back, lower without touching ground'
            },
            { 
                name: 'Russian Twists', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'abs',
                equipment: 'body weight',
                instructions: 'Sit with feet elevated, rotate torso side to side'
            },
            { 
                name: 'Mountain Climbers', 
                type: 'cardio', 
                difficulty: 'beginner', 
                muscle: 'abs',
                equipment: 'body weight',
                instructions: 'In plank position, alternate bringing knees to chest rapidly'
            }
        ],
        quadriceps: [
            { 
                name: 'Squats', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'quadriceps',
                equipment: 'barbell',
                instructions: 'Lower body keeping chest up, push back through heels'
            },
            { 
                name: 'Leg Extensions', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'quadriceps',
                equipment: 'machine',
                instructions: 'Extend legs until straight, lower with control'
            },
            { 
                name: 'Bulgarian Split Squats', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'quadriceps',
                equipment: 'dumbbells',
                instructions: 'Place rear foot on bench, lower into lunge position'
            }
        ],
        hamstrings: [
            { 
                name: 'Romanian Deadlifts', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'hamstrings',
                equipment: 'barbell',
                instructions: 'Lower bar with straight legs, feel stretch in hamstrings'
            },
            { 
                name: 'Leg Curls', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'hamstrings',
                equipment: 'machine',
                instructions: 'Curl legs towards glutes, squeeze at top'
            },
            { 
                name: 'Good Mornings', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'hamstrings',
                equipment: 'barbell',
                instructions: 'Hinge at hips keeping back straight, return to standing'
            }
        ],
        glutes: [
            { 
                name: 'Hip Thrusts', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'glutes',
                equipment: 'barbell',
                instructions: 'Drive hips up squeezing glutes at top, lower with control'
            },
            { 
                name: 'Bulgarian Split Squats', 
                type: 'strength', 
                difficulty: 'intermediate', 
                muscle: 'glutes',
                equipment: 'dumbbells',
                instructions: 'Rear foot elevated, lunge down and drive through front heel'
            },
            { 
                name: 'Glute Bridges', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'glutes',
                equipment: 'body weight',
                instructions: 'Lie on back, drive hips up, squeeze glutes at top'
            }
        ],
        calves: [
            { 
                name: 'Standing Calf Raises', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'calves',
                equipment: 'machine',
                instructions: 'Raise up onto toes, lower below parallel'
            },
            { 
                name: 'Seated Calf Raises', 
                type: 'strength', 
                difficulty: 'beginner', 
                muscle: 'calves',
                equipment: 'machine',
                instructions: 'While seated, raise heels up, lower with control'
            }
        ]
    };
    
    const muscleLower = muscle.toLowerCase();
    const exercises = allExercises[muscleLower] || allExercises.chest;
    return exercises.slice(0, MAX_RESULTS);
}

// ============================================
// API VALIDATION
// ============================================

export function isApiKeyConfigured() {
    const isConfigured = API_KEY !== 'YOUR_API_KEY_HERE' && API_KEY.length > 0;
    console.log('🔑 API Key configured:', isConfigured);
    return isConfigured;
}

export function getApiStatus() {
    return {
        configured: isApiKeyConfigured(),
        baseUrl: API_BASE_URL,
        cacheSize: exerciseCache.size,
        maxResults: MAX_RESULTS
    };
}

// ============================================
// MUSCLE GROUP HELPERS
// ============================================

export function getSupportedMuscles() {
    return [
        'biceps', 'triceps', 'chest', 'back', 'legs', 
        'shoulders', 'abs', 'quadriceps', 'hamstrings', 
        'glutes', 'calves', 'forearms', 'neck', 'traps'
    ];
}

export function validateMuscleGroup(muscle) {
    const supported = getSupportedMuscles();
    const muscleLower = muscle.toLowerCase().trim();
    return supported.includes(muscleLower);
}

// ============================================
// BATCH OPERATIONS
// ============================================

export async function fetchMultipleMuscleGroups(muscleGroups) {
    if (!Array.isArray(muscleGroups)) {
        throw new Error('muscleGroups must be an array');
    }
    
    const results = await Promise.allSettled(
        muscleGroups.map(muscle => fetchExercises(muscle))
    );
    
    return results.map((result, index) => ({
        muscle: muscleGroups[index],
        status: result.status,
        exercises: result.status === 'fulfilled' ? result.value : []
    }));
}

// ============================================
// EXPORT API INFO
// ============================================

console.log('✅ Exercise API module loaded');
console.log('🔑 API Key Status:', isApiKeyConfigured() ? 'Configured' : 'Not Configured');