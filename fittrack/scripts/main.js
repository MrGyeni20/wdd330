import { fetchExercises } from './exerciseAPI.js';
import { fetchQuote } from './quoteAPI.js';
import { calculateStats } from './stats.js';
import { 
    renderWorkouts, 
    renderStats, 
    renderExercises, 
    updateQuote, 
    showMessage, 
    clearForm 
} from './ui.js';
import { 
    getAllWorkouts, 
    saveWorkout, 
    deleteWorkout, 
    getStorageStats,
    exportWorkoutsToJSON,
    importWorkoutsFromJSON,
    clearAllWorkouts
} from './workoutManager.js';

// Global state
let allWorkouts = [];
let currentFilter = 'all';

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    console.log('🚀 FitTrack Initializing...');
    
    // Load initial data
    loadWorkouts();
    await loadQuote();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Display storage stats
    displayStorageInfo();
    
    console.log('✅ FitTrack Ready!');
}

// ============================================
// EVENT LISTENERS SETUP (10+ EVENTS)
// ============================================
function setupEventListeners() {
    // 1. SUBMIT EVENT - Form submission
    const workoutForm = document.getElementById('workoutForm');
    workoutForm.addEventListener('submit', handleFormSubmit);
    
    // 2. CLICK EVENT - Delete workout
    const workoutList = document.getElementById('workoutList');
    workoutList.addEventListener('click', handleWorkoutClick);
    
    // 3. CHANGE EVENT - Filter workouts
    const filterSelect = document.getElementById('filterSelect');
    filterSelect.addEventListener('change', handleFilterChange);
    
    // 4. CLICK EVENT - New quote
    const newQuoteBtn = document.getElementById('newQuoteBtn');
    newQuoteBtn.addEventListener('click', loadQuote);
    
    // 5. CLICK EVENT - Search exercises
    const searchBtn = document.getElementById('searchExercisesBtn');
    searchBtn.addEventListener('click', handleExerciseSearch);
    
    // 6. KEYPRESS EVENT - Search on Enter
    const muscleSearch = document.getElementById('muscleSearch');
    muscleSearch.addEventListener('keypress', handleSearchKeypress);
    
    // 7. CLICK EVENT - Select exercise
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.addEventListener('click', handleExerciseSelect);
    
    // 8. CLICK EVENT - Export data
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', handleExportData);
    
    // 9. INPUT EVENT - Real-time validation on exercise name
    const exerciseName = document.getElementById('exerciseName');
    exerciseName.addEventListener('input', handleExerciseInput);
    
    // 10. INPUT EVENT - Real-time validation on duration
    const duration = document.getElementById('duration');
    duration.addEventListener('input', validateDuration);
    
    // 11. INPUT EVENT - Real-time validation on calories
    const calories = document.getElementById('calories');
    calories.addEventListener('input', validateCalories);
    
    // 12. FOCUS EVENT - Enhanced UX for inputs
    const inputs = document.querySelectorAll('.input');
    inputs.forEach(input => {
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
    });
    
    // 13. DRAGSTART EVENT - Drag and drop
    workoutList.addEventListener('dragstart', handleDragStart);
    
    // 14. DRAGOVER EVENT - Drag and drop
    workoutList.addEventListener('dragover', handleDragOver);
    
    // 15. DROP EVENT - Drag and drop
    workoutList.addEventListener('drop', handleDrop);
    
    // 16. DRAGEND EVENT - Drag and drop
    workoutList.addEventListener('dragend', handleDragEnd);
    
    // 17. DBLCLICK EVENT - Quick edit
    workoutList.addEventListener('dblclick', handleWorkoutDoubleClick);
    
    // 18. CONTEXTMENU EVENT - Right-click options
    workoutList.addEventListener('contextmenu', handleContextMenu);
    
    // 19. SCROLL EVENT - Infinite loading indicator
    workoutList.addEventListener('scroll', handleWorkoutScroll);
    
    // 20. RESIZE EVENT - Responsive adjustments
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // 21. VISIBILITYCHANGE EVENT - Refresh when tab becomes visible
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 22. BEFOREUNLOAD EVENT - Warn about unsaved changes
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 23. CUSTOM EVENT - Workout updated
    document.addEventListener('workoutUpdated', handleWorkoutUpdated);
    
    console.log('✅ All 23+ event listeners registered');
}

// ============================================
// CORE FUNCTIONALITY - WORKOUTS
// ============================================
function loadWorkouts() {
    allWorkouts = getAllWorkouts();
    applyFilter(currentFilter);
    updateStats();
}

function applyFilter(filterType) {
    currentFilter = filterType;
    let filteredWorkouts = [...allWorkouts];
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    switch(filterType) {
        case 'week':
            filteredWorkouts = filteredWorkouts.filter(w => 
                new Date(w.date) >= weekAgo
            );
            break;
        case 'month':
            filteredWorkouts = filteredWorkouts.filter(w => 
                new Date(w.date) >= monthAgo
            );
            break;
        case 'cardio':
        case 'strength':
        case 'flexibility':
            filteredWorkouts = filteredWorkouts.filter(w => 
                w.type === filterType
            );
            break;
    }
    
    renderWorkouts(filteredWorkouts);
}

function updateStats() {
    const stats = calculateStats(allWorkouts);
    renderStats(stats);
}

// ============================================
// EVENT HANDLERS - FORM & WORKOUTS
// ============================================
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        exercise: document.getElementById('exerciseName').value.trim(),
        duration: parseInt(document.getElementById('duration').value),
        calories: parseInt(document.getElementById('calories').value),
        type: document.getElementById('workoutType').value
    };
    
    // Validate data
    if (!formData.exercise || formData.duration < 1 || formData.calories < 1) {
        showMessage('⚠️ Please fill in all fields correctly', 'error');
        return;
    }
    
    try {
        const newWorkout = saveWorkout(formData);
        loadWorkouts();
        clearForm();
        showMessage('✅ Workout logged successfully!', 'success');
        
        // Dispatch custom event
        dispatchWorkoutEvent('added', newWorkout);
    } catch (error) {
        console.error('Error saving workout:', error);
        showMessage('❌ Failed to save workout', 'error');
    }
}

function handleWorkoutClick(e) {
    if (e.target.classList.contains('delete-btn')) {
        const card = e.target.closest('.workout-card');
        const workoutId = card.dataset.id;
        handleDeleteWorkout(workoutId);
    }
}

function handleDeleteWorkout(workoutId) {
    if (confirm('Are you sure you want to delete this workout?')) {
        try {
            deleteWorkout(workoutId);
            loadWorkouts();
            showMessage('🗑️ Workout deleted', 'success');
            
            // Dispatch custom event
            dispatchWorkoutEvent('deleted', { id: workoutId });
        } catch (error) {
            console.error('Error deleting workout:', error);
            showMessage('❌ Failed to delete workout', 'error');
        }
    }
}

function handleFilterChange(e) {
    applyFilter(e.target.value);
}

// ============================================
// EVENT HANDLERS - EXERCISES
// ============================================
async function handleExerciseSearch() {
    const muscleInput = document.getElementById('muscleSearch');
    const muscle = muscleInput.value.trim().toLowerCase();
    
    if (!muscle) {
        showMessage('⚠️ Please enter a muscle group', 'error');
        return;
    }
    
    const loadingDiv = document.getElementById('loadingExercises');
    loadingDiv.classList.remove('hidden');
    
    try {
        const exercises = await fetchExercises(muscle);
        renderExercises(exercises);
        
        if (exercises.length > 0) {
            showMessage(`✅ Found ${exercises.length} exercises`, 'success');
        }
    } catch (error) {
        console.error('Error fetching exercises:', error);
        showMessage('❌ Failed to fetch exercises', 'error');
    } finally {
        loadingDiv.classList.add('hidden');
    }
}

function handleSearchKeypress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleExerciseSearch();
    }
}

function handleExerciseSelect(e) {
    const exerciseItem = e.target.closest('.exercise-item');
    if (exerciseItem) {
        const exerciseName = exerciseItem.dataset.name;
        document.getElementById('exerciseName').value = exerciseName;
        showMessage(`✅ Selected: ${exerciseName}`, 'success');
        
        // Scroll to form
        document.getElementById('workoutForm').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
}

// ============================================
// EVENT HANDLERS - QUOTE
// ============================================
async function loadQuote() {
    try {
        const quote = await fetchQuote();
        updateQuote(quote);
    } catch (error) {
        console.error('Error loading quote:', error);
    }
}

// ============================================
// EVENT HANDLERS - INPUT VALIDATION
// ============================================
function handleExerciseInput(e) {
    const value = e.target.value;
    let charCount = document.getElementById('charCount');
    
    if (!charCount) {
        charCount = createCharCounter();
    }
    
    charCount.textContent = `${value.length}/100`;
    
    if (value.length > 90) {
        e.target.style.borderColor = 'var(--color-warning)';
        charCount.style.color = 'var(--color-warning)';
    } else {
        e.target.style.borderColor = '';
        charCount.style.color = 'var(--color-text-light)';
    }
}

function validateDuration(e) {
    const value = parseInt(e.target.value);
    let feedback = e.target.nextElementSibling;
    
    if (!feedback || !feedback.classList.contains('input-feedback')) {
        feedback = createFeedback(e.target);
    }
    
    if (isNaN(value)) {
        feedback.textContent = '';
        return;
    }
    
    if (value > 180) {
        feedback.textContent = '⚠️ That\'s a long workout!';
        feedback.style.color = 'var(--color-warning)';
    } else if (value < 5) {
        feedback.textContent = '💪 Every minute counts!';
        feedback.style.color = 'var(--color-text-light)';
    } else {
        feedback.textContent = '✅ Good duration';
        feedback.style.color = 'var(--color-success)';
    }
}

function validateCalories(e) {
    const duration = parseInt(document.getElementById('duration').value) || 0;
    const calories = parseInt(e.target.value) || 0;
    let feedback = e.target.nextElementSibling;
    
    if (!feedback || !feedback.classList.contains('input-feedback')) {
        feedback = createFeedback(e.target);
    }
    
    if (isNaN(calories) || duration === 0) {
        feedback.textContent = '';
        return;
    }
    
    const caloriesPerMin = calories / duration;
    
    if (caloriesPerMin > 20) {
        feedback.textContent = '🔥 High intensity!';
        feedback.style.color = 'var(--color-error)';
    } else if (caloriesPerMin < 3) {
        feedback.textContent = '🧘 Light activity';
        feedback.style.color = 'var(--color-text-light)';
    } else {
        feedback.textContent = '✅ Good pace';
        feedback.style.color = 'var(--color-success)';
    }
}

function handleInputFocus(e) {
    e.target.parentElement.classList.add('focused');
    e.target.style.transform = 'scale(1.02)';
    e.target.style.transition = 'transform 0.2s ease';
}

function handleInputBlur(e) {
    e.target.parentElement.classList.remove('focused');
    e.target.style.transform = '';
}

// ============================================
// EVENT HANDLERS - DRAG AND DROP
// ============================================
let draggedElement = null;

function handleDragStart(e) {
    const card = e.target.closest('.workout-card');
    if (card) {
        draggedElement = card;
        card.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', card.innerHTML);
    }
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    const target = e.target.closest('.workout-card');
    if (target && target !== draggedElement) {
        target.style.borderTop = '3px solid var(--color-primary)';
    }
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    const target = e.target.closest('.workout-card');
    if (target && target !== draggedElement && draggedElement) {
        target.style.borderTop = '';
        
        // Get parent container
        const container = target.parentNode;
        
        // Insert dragged element before or after target
        const allCards = [...container.querySelectorAll('.workout-card')];
        const draggedIndex = allCards.indexOf(draggedElement);
        const targetIndex = allCards.indexOf(target);
        
        if (draggedIndex < targetIndex) {
            container.insertBefore(draggedElement, target.nextSibling);
        } else {
            container.insertBefore(draggedElement, target);
        }
        
        showMessage('✅ Workout order updated', 'success');
    }
    return false;
}

function handleDragEnd(e) {
    if (draggedElement) {
        draggedElement.style.opacity = '';
    }
    
    document.querySelectorAll('.workout-card').forEach(card => {
        card.style.borderTop = '';
    });
    
    draggedElement = null;
}

// ============================================
// EVENT HANDLERS - ADVANCED INTERACTIONS
// ============================================
function handleWorkoutDoubleClick(e) {
    const card = e.target.closest('.workout-card');
    if (card) {
        const workoutId = card.dataset.id;
        const workout = allWorkouts.find(w => w.id === workoutId);
        
        if (workout) {
            // Fill form with workout data
            document.getElementById('exerciseName').value = workout.exercise;
            document.getElementById('duration').value = workout.duration;
            document.getElementById('calories').value = workout.calories;
            document.getElementById('workoutType').value = workout.type;
            
            showMessage('📝 Workout loaded for editing', 'success');
            
            // Scroll to form
            document.getElementById('workoutForm').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }
    }
}

function handleContextMenu(e) {
    const card = e.target.closest('.workout-card');
    if (card) {
        e.preventDefault();
        const workoutId = card.dataset.id;
        showContextMenu(e.clientX, e.clientY, workoutId);
    }
}

function showContextMenu(x, y, workoutId) {
    // Remove existing context menu
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.innerHTML = `
        <div class="context-menu-item" data-action="edit">✏️ Edit</div>
        <div class="context-menu-item" data-action="duplicate">📋 Duplicate</div>
        <div class="context-menu-item" data-action="delete">🗑️ Delete</div>
    `;
    
    document.body.appendChild(menu);
    
    // Handle menu clicks
    menu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'delete') {
            handleDeleteWorkout(workoutId);
        } else if (action === 'edit') {
            const workout = allWorkouts.find(w => w.id === workoutId);
            if (workout) {
                document.getElementById('exerciseName').value = workout.exercise;
                document.getElementById('duration').value = workout.duration;
                document.getElementById('calories').value = workout.calories;
                document.getElementById('workoutType').value = workout.type;
            }
        } else if (action === 'duplicate') {
            const workout = allWorkouts.find(w => w.id === workoutId);
            if (workout) {
                saveWorkout({
                    exercise: workout.exercise,
                    duration: workout.duration,
                    calories: workout.calories,
                    type: workout.type
                });
                loadWorkouts();
                showMessage('✅ Workout duplicated', 'success');
            }
        }
        menu.remove();
    });
    
    // Remove menu on outside click
    setTimeout(() => {
        document.addEventListener('click', () => menu.remove(), { once: true });
    }, 100);
}

function handleWorkoutScroll(e) {
    const element = e.target;
    const scrollPercentage = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    
    if (scrollPercentage > 90) {
        console.log('📊 Reached bottom of workout list');
    }
}

// ============================================
// EVENT HANDLERS - WINDOW EVENTS
// ============================================
function handleResize() {
    const width = window.innerWidth;
    console.log('📐 Window resized to:', width);
    
    // Adjust layout for mobile
    if (width < 768) {
        document.body.classList.add('mobile-view');
    } else {
        document.body.classList.remove('mobile-view');
    }
}

function handleVisibilityChange() {
    if (!document.hidden) {
        console.log('👁️ Tab visible - refreshing data');
        loadWorkouts();
        loadQuote();
    }
}

function handleBeforeUnload(e) {
    const form = document.getElementById('workoutForm');
    const hasUnsavedData = form.querySelector('#exerciseName').value.length > 0;
    
    if (hasUnsavedData) {
        e.preventDefault();
        e.returnValue = 'You have unsaved workout data. Are you sure you want to leave?';
        return e.returnValue;
    }
}

function handleWorkoutUpdated(e) {
    console.log('🔄 Custom event - Workout updated:', e.detail);
}

// ============================================
// DATA EXPORT/IMPORT
// ============================================
function handleExportData() {
    try {
        const stats = getStorageStats();
        const confirm = window.confirm(
            `Export all ${stats.totalWorkouts} workouts?\n\n` +
            `Total data size: ${stats.sizeInKB} KB`
        );
        
        if (confirm) {
            const jsonData = exportWorkoutsToJSON();
            downloadJSON(jsonData, `fittrack-export-${Date.now()}.json`);
            showMessage('✅ Data exported successfully!', 'success');
        }
    } catch (error) {
        console.error('Export error:', error);
        showMessage('❌ Failed to export data', 'error');
    }
}

function downloadJSON(data, filename) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// STORAGE INFO DISPLAY
// ============================================
function displayStorageInfo() {
    const stats = getStorageStats();
    console.log('💾 Storage Stats:', stats);
    
    if (parseFloat(stats.percentUsed) > 80) {
        showMessage('⚠️ Storage nearly full! Consider exporting data.', 'error');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function createCharCounter() {
    const counter = document.createElement('span');
    counter.id = 'charCount';
    counter.className = 'char-counter';
    counter.style.fontSize = '0.8rem';
    counter.style.color = 'var(--color-text-light)';
    counter.style.marginTop = '0.25rem';
    counter.style.display = 'block';
    document.getElementById('exerciseName').parentElement.appendChild(counter);
    return counter;
}

function createFeedback(input) {
    const feedback = document.createElement('span');
    feedback.className = 'input-feedback';
    feedback.style.fontSize = '0.8rem';
    feedback.style.marginTop = '0.25rem';
    feedback.style.display = 'block';
    input.parentElement.appendChild(feedback);
    return feedback;
}

function dispatchWorkoutEvent(action, data) {
    const event = new CustomEvent('workoutUpdated', {
        detail: { action, data, timestamp: Date.now() },
        bubbles: true
    });
    document.dispatchEvent(event);
}

// Make functions globally available for debugging
window.FitTrack = {
    loadWorkouts,
    getAllWorkouts,
    getStorageStats,
    clearAllWorkouts
};