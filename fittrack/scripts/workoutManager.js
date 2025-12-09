const STORAGE_KEY = 'fittrack_workouts';

export function getAllWorkouts() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        const workouts = JSON.parse(data);
        return workouts.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error('Error loading workouts:', error);
        return [];
    }
}

export function saveWorkout(workoutData) {
    try {
        const workouts = getAllWorkouts();
        const newWorkout = {
            id: generateId(),
            exercise: workoutData.exercise,
            duration: workoutData.duration,
            calories: workoutData.calories,
            type: workoutData.type,
            date: getCurrentDate(),
            timestamp: Date.now()
        };
        workouts.unshift(newWorkout);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
        return true;
    } catch (error) {
        console.error('Error saving workout:', error);
        return false;
    }
}

export function deleteWorkout(workoutId) {
    try {
        const workouts = getAllWorkouts();
        const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
        if (updatedWorkouts.length === workouts.length) {
            console.warn('Workout not found:', workoutId);
            return false;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorkouts));
        return true;
    } catch (error) {
        console.error('Error deleting workout:', error);
        return false;
    }
}

export function clearAllWorkouts() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing workouts:', error);
        return false;
    }
}

function generateId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${timestamp}_${random}`;
}

function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}