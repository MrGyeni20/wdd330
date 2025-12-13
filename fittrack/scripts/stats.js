// ============================================
// STATISTICS CALCULATOR
// ============================================

export function calculateStats(workouts) {
    if (!workouts || workouts.length === 0) {
        return getEmptyStats();
    }
    
    const weekWorkouts = getWorkoutsThisWeek(workouts);
    const monthWorkouts = getWorkoutsThisMonth(workouts);
    
    const stats = {
        // Weekly stats
        totalWorkouts: weekWorkouts.length,
        totalCalories: calculateTotalCalories(weekWorkouts),
        totalDuration: calculateTotalDuration(weekWorkouts),
        avgDuration: calculateAverageDuration(weekWorkouts),
        avgCalories: calculateAverageCalories(weekWorkouts),
        topExercise: findTopExercise(weekWorkouts),
        
        // Monthly stats
        monthlyWorkouts: monthWorkouts.length,
        monthlyCalories: calculateTotalCalories(monthWorkouts),
        monthlyDuration: calculateTotalDuration(monthWorkouts),
        
        // All-time stats
        allTimeWorkouts: workouts.length,
        allTimeCalories: calculateTotalCalories(workouts),
        allTimeDuration: calculateTotalDuration(workouts),
        
        // By type (weekly)
        cardioCount: countByType(weekWorkouts, 'cardio'),
        strengthCount: countByType(weekWorkouts, 'strength'),
        flexibilityCount: countByType(weekWorkouts, 'flexibility'),
        
        // Additional insights
        mostProductiveDay: findMostProductiveDay(weekWorkouts),
        longestWorkout: findLongestWorkout(workouts),
        highestCalorieBurn: findHighestCalorieBurn(workouts),
        currentStreak: calculateStreak(workouts),
        weeklyGoalProgress: calculateWeeklyGoalProgress(weekWorkouts)
    };
    
    return stats;
}

// ============================================
// BASIC CALCULATIONS
// ============================================
function calculateTotalCalories(workouts) {
    return workouts.reduce((total, workout) => {
        return total + (parseInt(workout.calories) || 0);
    }, 0);
}

function calculateTotalDuration(workouts) {
    return workouts.reduce((total, workout) => {
        return total + (parseInt(workout.duration) || 0);
    }, 0);
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

// ============================================
// EXERCISE ANALYSIS
// ============================================
function findTopExercise(workouts) {
    if (workouts.length === 0) return 'None';
    
    const exerciseCounts = {};
    const exerciseCalories = {};
    
    workouts.forEach(workout => {
        const exercise = workout.exercise;
        exerciseCounts[exercise] = (exerciseCounts[exercise] || 0) + 1;
        exerciseCalories[exercise] = (exerciseCalories[exercise] || 0) + workout.calories;
    });
    
    // Find most frequent exercise
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

function findMostProductiveDay(workouts) {
    if (workouts.length === 0) return 'None';
    
    const dayCalories = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    workouts.forEach(workout => {
        const date = new Date(workout.date);
        const dayName = days[date.getDay()];
        dayCalories[dayName] = (dayCalories[dayName] || 0) + workout.calories;
    });
    
    let mostProductiveDay = 'None';
    let maxCalories = 0;
    
    for (const [day, calories] of Object.entries(dayCalories)) {
        if (calories > maxCalories) {
            maxCalories = calories;
            mostProductiveDay = day;
        }
    }
    
    return mostProductiveDay;
}

function findLongestWorkout(workouts) {
    if (workouts.length === 0) return null;
    
    return workouts.reduce((longest, current) => {
        return current.duration > (longest.duration || 0) ? current : longest;
    }, {});
}

function findHighestCalorieBurn(workouts) {
    if (workouts.length === 0) return null;
    
    return workouts.reduce((highest, current) => {
        return current.calories > (highest.calories || 0) ? current : highest;
    }, {});
}

// ============================================
// TYPE ANALYSIS
// ============================================
function countByType(workouts, type) {
    return workouts.filter(w => w.type === type).length;
}

export function getWorkoutTypeDistribution(workouts) {
    const distribution = {
        cardio: { count: 0, calories: 0, duration: 0 },
        strength: { count: 0, calories: 0, duration: 0 },
        flexibility: { count: 0, calories: 0, duration: 0 }
    };
    
    workouts.forEach(workout => {
        const type = workout.type;
        if (distribution[type]) {
            distribution[type].count++;
            distribution[type].calories += workout.calories;
            distribution[type].duration += workout.duration;
        }
    });
    
    return distribution;
}

// ============================================
// DATE FILTERING
// ============================================
function getWorkoutsThisWeek(workouts) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= weekAgo && workoutDate <= now;
    });
}

function getWorkoutsThisMonth(workouts) {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= monthAgo && workoutDate <= now;
    });
}

export function getWorkoutsToday(workouts) {
    const today = new Date().toISOString().split('T')[0];
    return workouts.filter(workout => workout.date === today);
}

export function getWorkoutsByDateRange(workouts, startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return workouts.filter(workout => {
        const workoutDate = new Date(workout.date).getTime();
        return workoutDate >= start && workoutDate <= end;
    });
}

// ============================================
// STREAK CALCULATION
// ============================================
function calculateStreak(workouts) {
    if (workouts.length === 0) return 0;
    
    // Sort workouts by date (most recent first)
    const sortedWorkouts = [...workouts].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Get unique dates
    const uniqueDates = [...new Set(sortedWorkouts.map(w => w.date))];
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < uniqueDates.length; i++) {
        const workoutDate = new Date(uniqueDates[i]);
        workoutDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
            streak++;
        } else if (daysDiff > streak) {
            break;
        }
    }
    
    return streak;
}

// ============================================
// GOAL TRACKING
// ============================================
function calculateWeeklyGoalProgress(workouts) {
    const weeklyGoal = 5; // Default: 5 workouts per week
    const progress = (workouts.length / weeklyGoal) * 100;
    
    return {
        current: workouts.length,
        goal: weeklyGoal,
        percentage: Math.min(Math.round(progress), 100),
        achieved: workouts.length >= weeklyGoal
    };
}

export function calculateCalorieGoal(workouts, goalCalories) {
    const totalCalories = calculateTotalCalories(workouts);
    const progress = (totalCalories / goalCalories) * 100;
    
    return {
        current: totalCalories,
        goal: goalCalories,
        percentage: Math.min(Math.round(progress), 100),
        remaining: Math.max(goalCalories - totalCalories, 0),
        achieved: totalCalories >= goalCalories
    };
}

// ============================================
// TRENDS ANALYSIS
// ============================================
export function calculateWeeklyTrend(workouts) {
    const thisWeek = getWorkoutsThisWeek(workouts);
    const lastWeekStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const lastWeek = workouts.filter(workout => {
        const date = new Date(workout.date);
        return date >= lastWeekStart && date < lastWeekEnd;
    });
    
    const thisWeekCalories = calculateTotalCalories(thisWeek);
    const lastWeekCalories = calculateTotalCalories(lastWeek);
    
    const change = thisWeekCalories - lastWeekCalories;
    const percentChange = lastWeekCalories > 0 
        ? Math.round((change / lastWeekCalories) * 100)
        : 0;
    
    return {
        thisWeek: {
            workouts: thisWeek.length,
            calories: thisWeekCalories,
            duration: calculateTotalDuration(thisWeek)
        },
        lastWeek: {
            workouts: lastWeek.length,
            calories: lastWeekCalories,
            duration: calculateTotalDuration(lastWeek)
        },
        change: {
            workouts: thisWeek.length - lastWeek.length,
            calories: change,
            percentChange: percentChange
        },
        trending: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
}

// ============================================
// DAILY BREAKDOWN
// ============================================
export function getDailyBreakdown(workouts) {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayWorkouts = workouts.filter(w => w.date === dateStr);
        
        last7Days.push({
            date: dateStr,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            workouts: dayWorkouts.length,
            calories: calculateTotalCalories(dayWorkouts),
            duration: calculateTotalDuration(dayWorkouts)
        });
    }
    
    return last7Days;
}

// ============================================
// PERSONAL RECORDS
// ============================================
export function getPersonalRecords(workouts) {
    if (workouts.length === 0) {
        return {
            longestWorkout: null,
            mostCalories: null,
            mostWorkoutsInDay: null,
            longestStreak: 0
        };
    }
    
    // Longest single workout
    const longestWorkout = findLongestWorkout(workouts);
    
    // Highest calorie burn
    const mostCalories = findHighestCalorieBurn(workouts);
    
    // Most workouts in a single day
    const workoutsByDate = {};
    workouts.forEach(workout => {
        workoutsByDate[workout.date] = (workoutsByDate[workout.date] || 0) + 1;
    });
    
    const mostWorkoutsInDay = Math.max(...Object.values(workoutsByDate), 0);
    
    // Longest streak (historical)
    const longestStreak = calculateLongestStreak(workouts);
    
    return {
        longestWorkout,
        mostCalories,
        mostWorkoutsInDay,
        longestStreak
    };
}

function calculateLongestStreak(workouts) {
    if (workouts.length === 0) return 0;
    
    const uniqueDates = [...new Set(workouts.map(w => w.date))].sort();
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }
    
    return maxStreak;
}

// ============================================
// EMPTY STATE
// ============================================
function getEmptyStats() {
    return {
        totalWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        avgDuration: 0,
        avgCalories: 0,
        topExercise: 'None',
        monthlyWorkouts: 0,
        monthlyCalories: 0,
        monthlyDuration: 0,
        allTimeWorkouts: 0,
        allTimeCalories: 0,
        allTimeDuration: 0,
        cardioCount: 0,
        strengthCount: 0,
        flexibilityCount: 0,
        mostProductiveDay: 'None',
        longestWorkout: null,
        highestCalorieBurn: null,
        currentStreak: 0,
        weeklyGoalProgress: {
            current: 0,
            goal: 5,
            percentage: 0,
            achieved: false
        }
    };
}