export function calculateStats(workouts) {
    const weekWorkouts = getWorkoutsThisWeek(workouts);
    
    const stats = {
        totalWorkouts: weekWorkouts.length,
        totalCalories: calculateTotalCalories(weekWorkouts),
        totalDuration: calculateTotalDuration(weekWorkouts),
        topExercise: findTopExercise(weekWorkouts),
        allTimeWorkouts: workouts.length,
        allTimeCalories: calculateTotalCalories(workouts),
        avgDuration: calculateAverageDuration(weekWorkouts),
        avgCalories: calculateAverageCalories(weekWorkouts),
        cardioCount: countByType(weekWorkouts, 'cardio'),
        strengthCount: countByType(weekWorkouts, 'strength'),
        flexibilityCount: countByType(weekWorkouts, 'flexibility')
    };
    
    return stats;
}

function calculateTotalCalories(workouts) {
    return workouts.reduce((total, workout) => total + (workout.calories || 0), 0);
}

function calculateTotalDuration(workouts) {
    return workouts.reduce((total, workout) => total + (workout.duration || 0), 0);
}

function calculateAverageDuration(workouts) {
    if (workouts.length === 0) return 0;
    const total = calculateTotalDuration(workouts);
    return Math.round(total / workouts.length);
}

function calculateAverageCalories(workouts) {
    if (workouts.length === 0) return 0;
    const total = calculateTotalCalories(workouts);
    return Math.round(total / workouts.length);
}

function findTopExercise(workouts) {
    if (workouts.length === 0) return 'None';
    
    const exerciseCounts = {};
    workouts.forEach(workout => {
        const exercise = workout.exercise;
        exerciseCounts[exercise] = (exerciseCounts[exercise] || 0) + 1;
    });
    
    let topExercise = 'None';
    let maxCount = 0;
    
    for (const [exercise, count] of Object.entries(exerciseCounts)) {
        if (count > maxCount) {
            maxCount = count;
            topExercise = exercise;
        }
    }
    
    return topExercise;
}

function countByType(workouts, type) {
    return workouts.filter(w => w.type === type).length;
}

function getWorkoutsThisWeek(workouts) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= weekAgo && workoutDate <= now;
    });
}