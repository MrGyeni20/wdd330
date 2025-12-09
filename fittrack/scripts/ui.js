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
    
    workouts.forEach(workout => {
        const workoutCard = createWorkoutCard(workout);
        workoutList.appendChild(workoutCard);
    });
}

function createWorkoutCard(workout) {
    const card = document.createElement('div');
    card.className = 'workout-card';
    card.dataset.id = workout.id;
    
    const date = formatDate(workout.date);
    
    card.innerHTML = `
        <div class="workout-header">
            <div class="workout-info">
                <h3>${escapeHtml(workout.exercise)}</h3>
                <span class="workout-date">${date}</span>
            </div>
            <button class="delete-btn" title="Delete workout" aria-label="Delete workout">
                🗑️
            </button>
        </div>
        <div class="workout-footer">
            <span class="workout-badge ${workout.type}">${workout.type}</span>
            <span class="workout-stat">⏱️ ${workout.duration} min</span>
            <span class="workout-stat">🔥 ${workout.calories} cal</span>
        </div>
    `;
    
    return card;
}

export function renderStats(stats) {
    const totalWorkoutsEl = document.getElementById('totalWorkouts');
    if (totalWorkoutsEl) {
        totalWorkoutsEl.textContent = stats.totalWorkouts || 0;
    }
    
    const totalCaloriesEl = document.getElementById('totalCalories');
    if (totalCaloriesEl) {
        totalCaloriesEl.textContent = (stats.totalCalories || 0).toLocaleString();
    }
    
    const topExerciseEl = document.getElementById('topExercise');
    if (topExerciseEl) {
        topExerciseEl.textContent = stats.topExercise || 'None';
    }
}

export function renderExercises(exercises) {
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';
    
    if (!exercises || exercises.length === 0) {
        exerciseList.innerHTML = '<p class="text-muted">No exercises found.</p>';
        return;
    }
    
    exercises.forEach(exercise => {
        const exerciseCard = createExerciseCard(exercise);
        exerciseList.appendChild(exerciseCard);
    });
}

function createExerciseCard(exercise) {
    const card = document.createElement('div');
    card.className = 'exercise-item';
    card.dataset.name = exercise.name;
    
    card.innerHTML = `
        <span class="exercise-name">${escapeHtml(exercise.name)}</span>
        <span class="exercise-details">
            ${exercise.type || 'Exercise'} • ${exercise.difficulty || 'All levels'}
        </span>
    `;
    
    return card;
}

export function updateQuote(quote) {
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    
    if (quoteText) {
        quoteText.textContent = `"${quote.text}"`;
    }
    
    if (quoteAuthor) {
        quoteAuthor.textContent = `— ${quote.author}`;
    }
}

export function showMessage(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

export function clearForm() {
    const form = document.getElementById('workoutForm');
    if (form) {
        form.reset();
        const firstInput = document.getElementById('exerciseName');
        if (firstInput) {
            firstInput.focus();
        }
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}