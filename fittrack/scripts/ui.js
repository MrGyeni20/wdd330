// ============================================
// UI RENDERING FUNCTIONS
// ============================================

export function renderWorkouts(workouts) {
    const workoutList = document.getElementById('workoutList');
    workoutList.innerHTML = '';
    
    if (!workouts || workouts.length === 0) {
        workoutList.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">💪</span>
                <p class="empty-text">No workouts logged yet.</p>
                <p class="empty-subtext">Start by adding your first workout!</p>
            </div>
        `;
        return;
    }
    
    workouts.forEach((workout, index) => {
        const workoutCard = createWorkoutCard(workout, index);
        workoutList.appendChild(workoutCard);
    });
    
    console.log(`✅ Rendered ${workouts.length} workouts`);
}

function createWorkoutCard(workout, index) {
    const card = document.createElement('div');
    card.className = 'workout-card';
    card.dataset.id = workout.id;
    card.setAttribute('draggable', 'true');
    card.setAttribute('role', 'listitem');
    
    const date = formatDate(workout.date);
    
    card.innerHTML = `
        <div class="workout-header">
            <div class="workout-info">
                <h3>${escapeHtml(workout.exercise)}</h3>
                <span class="workout-date">${date}</span>
            </div>
            <button class="delete-btn" title="Delete workout" aria-label="Delete ${escapeHtml(workout.exercise)} workout">
                🗑️
            </button>
        </div>
        <div class="workout-footer">
            <span class="workout-badge ${workout.type}">${workout.type}</span>
            <span class="workout-stat">⏱️ ${workout.duration} min</span>
            <span class="workout-stat">🔥 ${workout.calories} cal</span>
        </div>
    `;
    
    // Add animation delay for staggered effect
    card.style.animationDelay = `${index * 0.05}s`;
    
    return card;
}

// ============================================
// STATISTICS RENDERING
// ============================================

export function renderStats(stats) {
    // Total workouts
    const totalWorkoutsEl = document.getElementById('totalWorkouts');
    if (totalWorkoutsEl) {
        animateValue(totalWorkoutsEl, 0, stats.totalWorkouts || 0, 500);
    }
    
    // Total calories
    const totalCaloriesEl = document.getElementById('totalCalories');
    if (totalCaloriesEl) {
        const calories = stats.totalCalories || 0;
        animateValue(totalCaloriesEl, 0, calories, 500, true);
    }
    
    // Top exercise
    const topExerciseEl = document.getElementById('topExercise');
    if (topExerciseEl) {
        topExerciseEl.textContent = stats.topExercise || 'None';
    }
    
    console.log('✅ Stats updated:', stats);
}

// Animate number changes
function animateValue(element, start, end, duration, useComma = false) {
    const range = end - start;
    const increment = range / (duration / 16); // 60 FPS
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        const value = Math.floor(current);
        element.textContent = useComma ? value.toLocaleString() : value;
    }, 16);
}

// ============================================
// EXERCISE LIST RENDERING
// ============================================

export function renderExercises(exercises) {
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';
    
    if (!exercises || exercises.length === 0) {
        exerciseList.innerHTML = '<p class="text-muted">No exercises found. Try a different muscle group.</p>';
        return;
    }
    
    exercises.forEach((exercise, index) => {
        const exerciseCard = createExerciseCard(exercise, index);
        exerciseList.appendChild(exerciseCard);
    });
    
    console.log(`✅ Rendered ${exercises.length} exercises`);
}

function createExerciseCard(exercise, index) {
    const card = document.createElement('div');
    card.className = 'exercise-item';
    card.dataset.name = exercise.name;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    
    const difficulty = exercise.difficulty || 'All levels';
    const type = exercise.type || 'Exercise';
    
    card.innerHTML = `
        <span class="exercise-name">${escapeHtml(exercise.name)}</span>
        <span class="exercise-details">
            ${type} • ${difficulty}
        </span>
    `;
    
    // Add animation delay
    card.style.animationDelay = `${index * 0.05}s`;
    card.style.animation = 'fadeIn 0.3s ease-out';
    
    // Keyboard accessibility
    card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });
    
    return card;
}

// ============================================
// QUOTE DISPLAY
// ============================================

export function updateQuote(quote) {
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    
    if (quoteText && quote.text) {
        // Fade out
        quoteText.style.opacity = '0';
        
        setTimeout(() => {
            quoteText.textContent = `"${quote.text}"`;
            // Fade in
            quoteText.style.transition = 'opacity 0.5s ease';
            quoteText.style.opacity = '1';
        }, 300);
    }
    
    if (quoteAuthor && quote.author) {
        setTimeout(() => {
            quoteAuthor.textContent = `— ${quote.author}`;
        }, 300);
    }
    
    console.log('✅ Quote updated');
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

let toastTimeout;

export function showMessage(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) {
        console.warn('Toast elements not found');
        return;
    }
    
    // Clear existing timeout
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    // Update content and style
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
    
    console.log(`📢 Toast: ${message} (${type})`);
}

// ============================================
// FORM HANDLING
// ============================================

export function clearForm() {
    const form = document.getElementById('workoutForm');
    if (!form) return;
    
    form.reset();
    
    // Clear any feedback messages
    const feedbacks = document.querySelectorAll('.input-feedback');
    feedbacks.forEach(f => f.textContent = '');
    
    // Clear character counter
    const charCounter = document.getElementById('charCount');
    if (charCounter) {
        charCounter.textContent = '0/100';
    }
    
    // Focus first input
    const firstInput = document.getElementById('exerciseName');
    if (firstInput) {
        firstInput.focus();
    }
    
    console.log('✅ Form cleared');
}

export function fillForm(workout) {
    if (!workout) return;
    
    const exerciseName = document.getElementById('exerciseName');
    const duration = document.getElementById('duration');
    const calories = document.getElementById('calories');
    const workoutType = document.getElementById('workoutType');
    
    if (exerciseName) exerciseName.value = workout.exercise;
    if (duration) duration.value = workout.duration;
    if (calories) calories.value = workout.calories;
    if (workoutType) workoutType.value = workout.type;
    
    console.log('✅ Form filled with workout data');
}

// ============================================
// LOADING STATES
// ============================================

export function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
    }
}

export function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    if (compareDate.getTime() === today.getTime()) {
        return 'Today';
    }
    
    if (compareDate.getTime() === yesterday.getTime()) {
        return 'Yesterday';
    }
    
    // This week
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    if (compareDate > weekAgo) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    }
    
    // Older dates
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// ADVANCED UI FEATURES
// ============================================

export function highlightElement(elementId, duration = 2000) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.style.transition = 'background-color 0.3s ease';
    element.style.backgroundColor = 'var(--color-primary-light)';
    
    setTimeout(() => {
        element.style.backgroundColor = '';
    }, duration);
}

export function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

// Smooth scroll to top
export function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ============================================
// PROGRESS INDICATORS
// ============================================

export function showProgress(percentage, containerId = 'progressContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="progress-bar" style="
            width: 100%;
            height: 8px;
            background: var(--color-border);
            border-radius: 4px;
            overflow: hidden;
        ">
            <div class="progress-fill" style="
                width: ${percentage}%;
                height: 100%;
                background: var(--color-primary);
                transition: width 0.5s ease;
            "></div>
        </div>
        <p style="
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: var(--color-text-light);
        ">${percentage}% Complete</p>
    `;
}

// ============================================
// CONFIRMATION DIALOGS
// ============================================

export function showConfirmDialog(message, onConfirm, onCancel) {
    const confirmed = window.confirm(message);
    
    if (confirmed && typeof onConfirm === 'function') {
        onConfirm();
    } else if (!confirmed && typeof onCancel === 'function') {
        onCancel();
    }
    
    return confirmed;
}

// ============================================
// DATA DISPLAY HELPERS
// ============================================

export function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return num.toLocaleString();
}

export function formatDuration(minutes) {
    if (!minutes) return '0 min';
    
    if (minutes < 60) {
        return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
        return `${hours}h`;
    }
    
    return `${hours}h ${mins}m`;
}

export function formatCalories(calories) {
    if (!calories) return '0 cal';
    
    if (calories < 1000) {
        return `${calories} cal`;
    }
    
    return `${(calories / 1000).toFixed(1)}k cal`;
}

// ============================================
// EXPORT FOR TESTING
// ============================================

export const UIHelpers = {
    formatDate,
    escapeHtml,
    formatNumber,
    formatDuration,
    formatCalories
};

console.log('✅ UI module loaded');