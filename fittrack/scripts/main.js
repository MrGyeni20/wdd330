// Import all modules
import { saveWorkout, getAllWorkouts, deleteWorkout } from './workoutManager.js';
import { fetchExercises } from './exerciseAPI.js';
import { fetchQuote } from './quoteAPI.js';
import { renderWorkouts, renderStats, renderExercises, showMessage, clearForm, updateQuote } from './ui.js';
import { calculateStats } from './stats.js';
import { filterWorkoutsByRange, filterWorkoutsByType, exportToCSV } from './utils.js';

let currentFilter = 'all';
let allWorkouts = [];

function initApp() {
    console.log('🏋️ FitTrack initialized');
    loadWorkouts();
    loadQuote();
    setupEventListeners();
}

function loadWorkouts() {
    allWorkouts = getAllWorkouts();
    applyCurrentFilter();
    updateStatistics();
}

function applyCurrentFilter() {
    let filteredWorkouts;
    
    if (currentFilter === 'all') {
        filteredWorkouts = allWorkouts;
    } else if (currentFilter === 'week') {
        filteredWorkouts = filterWorkoutsByRange(allWorkouts, 'week');
    } else if (currentFilter === 'month') {
        filteredWorkouts = filterWorkoutsByRange(allWorkouts, 'month');
    } else {
        filteredWorkouts = filterWorkoutsByType(allWorkouts, currentFilter);
    }
    
    renderWorkouts(filteredWorkouts);
}

function updateStatistics() {
    const stats = calculateStats(allWorkouts);
    renderStats(stats);
}

async function loadQuote() {
    try {
        const quote = await fetchQuote();
        updateQuote(quote);
    } catch (error) {
        console.error('Failed to load quote:', error);
        updateQuote({
            text: 'Stay strong and keep pushing forward!',
            author: 'FitTrack'
        });
    }
}

function setupEventListeners() {
    const workoutForm = document.getElementById('workoutForm');
    workoutForm.addEventListener('submit', handleFormSubmit);
    
    const filterSelect = document.getElementById('filterSelect');
    filterSelect.addEventListener('change', handleFilterChange);
    
    const newQuoteBtn = document.getElementById('newQuoteBtn');
    newQuoteBtn.addEventListener('click', handleNewQuote);
    
    const searchBtn = document.getElementById('searchExercisesBtn');
    searchBtn.addEventListener('click', handleExerciseSearch);
    
    const muscleSearch = document.getElementById('muscleSearch');
    muscleSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleExerciseSearch();
        }
    });
    
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', handleExport);
    
    const workoutList = document.getElementById('workoutList');
    workoutList.addEventListener('click', handleWorkoutListClick);
    
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.addEventListener('click', handleExerciseClick);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const exerciseName = document.getElementById('exerciseName').value.trim();
    const duration = parseInt(document.getElementById('duration').value);
    const calories = parseInt(document.getElementById('calories').value);
    const workoutType = document.getElementById('workoutType').value;
    
    if (!exerciseName || !duration || !calories) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    const workout = {
        exercise: exerciseName,
        duration: duration,
        calories: calories,
        type: workoutType
    };
    
    const saved = saveWorkout(workout);
    
    if (saved) {
        showMessage('Workout logged successfully! 💪', 'success');
        clearForm();
        loadWorkouts();
    } else {
        showMessage('Failed to save workout. Please try again.', 'error');
    }
}

function handleFilterChange(e) {
    currentFilter = e.target.value;
    applyCurrentFilter();
}

async function handleNewQuote() {
    await loadQuote();
    showMessage('New quote loaded! ✨', 'success');
}

async function handleExerciseSearch() {
    const muscleInput = document.getElementById('muscleSearch');
    const muscle = muscleInput.value.trim().toLowerCase();
    
    if (!muscle) {
        showMessage('Please enter a muscle group', 'error');
        return;
    }
    
    const loadingDiv = document.getElementById('loadingExercises');
    const exerciseListDiv = document.getElementById('exerciseList');
    loadingDiv.classList.remove('hidden');
    exerciseListDiv.innerHTML = '';
    
    try {
        const exercises = await fetchExercises(muscle);
        loadingDiv.classList.add('hidden');
        
        if (exercises && exercises.length > 0) {
            renderExercises(exercises);
            showMessage(`Found ${exercises.length} exercises!`, 'success');
        } else {
            exerciseListDiv.innerHTML = '<p class="text-muted">No exercises found. Try another muscle group.</p>';
            showMessage('No exercises found', 'error');
        }
    } catch (error) {
        loadingDiv.classList.add('hidden');
        exerciseListDiv.innerHTML = '<p class="text-muted">Failed to load exercises. Please try again.</p>';
        showMessage('Failed to search exercises', 'error');
        console.error('Exercise search error:', error);
    }
}

function handleWorkoutListClick(e) {
    if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
        const workoutCard = e.target.closest('.workout-card');
        if (workoutCard) {
            const workoutId = workoutCard.dataset.id;
            handleDeleteWorkout(workoutId);
        }
    }
}

function handleDeleteWorkout(workoutId) {
    const confirmed = confirm('Are you sure you want to delete this workout?');
    
    if (confirmed) {
        const deleted = deleteWorkout(workoutId);
        
        if (deleted) {
            showMessage('Workout deleted', 'success');
            loadWorkouts();
        } else {
            showMessage('Failed to delete workout', 'error');
        }
    }
}

function handleExerciseClick(e) {
    const exerciseItem = e.target.closest('.exercise-item');
    
    if (exerciseItem) {
        const exerciseName = exerciseItem.dataset.name;
        document.getElementById('exerciseName').value = exerciseName;
        document.getElementById('workoutForm').scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
        showMessage(`"${exerciseName}" added to form! 📝`, 'success');
    }
}

function handleExport() {
    if (allWorkouts.length === 0) {
        showMessage('No workouts to export', 'error');
        return;
    }
    
    try {
        exportToCSV(allWorkouts);
        showMessage('Workouts exported successfully! 📥', 'success');
    } catch (error) {
        showMessage('Failed to export workouts', 'error');
        console.error('Export error:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}