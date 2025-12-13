// ============================================
// WORKOUT MANAGER - LOCALSTORAGE OPERATIONS
// ============================================

const STORAGE_KEY = 'fittrack_workouts';
const STORAGE_VERSION = '2.0';
const VERSION_KEY = 'fittrack_version';
const SETTINGS_KEY = 'fittrack_settings';

// ============================================
// CREATE - Save new workout
// ============================================
export function saveWorkout(workoutData) {
    try {
        const workouts = getAllWorkouts();
        const newWorkout = {
            id: generateId(),
            exercise: sanitizeInput(workoutData.exercise),
            duration: parseInt(workoutData.duration),
            calories: parseInt(workoutData.calories),
            type: workoutData.type,
            date: getCurrentDate(),
            timestamp: Date.now(),
            notes: workoutData.notes || ''
        };
        
        // Validate before saving
        if (!validateWorkout(newWorkout)) {
            throw new Error('Invalid workout data');
        }
        
        workouts.unshift(newWorkout);
        
        // Check storage size before saving
        checkStorageQuota(workouts);
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
        
        console.log('✅ Workout saved:', newWorkout);
        return newWorkout;
    } catch (error) {
        console.error('❌ Error saving workout:', error);
        throw error;
    }
}

// ============================================
// READ - Get all workouts
// ============================================
export function getAllWorkouts() {
    try {
        // Check and migrate storage version if needed
        checkStorageVersion();
        
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            console.log('📦 No workouts found in storage');
            return [];
        }
        
        const workouts = JSON.parse(data);
        
        // Validate data structure
        if (!Array.isArray(workouts)) {
            console.warn('⚠️ Invalid workout data format, resetting...');
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }
        
        // Validate each workout and filter invalid ones
        const validWorkouts = workouts.filter(workout => {
            const isValid = validateWorkout(workout);
            if (!isValid) {
                console.warn('⚠️ Invalid workout found:', workout);
            }
            return isValid;
        });
        
        // Sort by timestamp (newest first)
        return validWorkouts.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('❌ Storage quota exceeded!');
            alert('Storage quota exceeded! Please export and delete old data.');
        }
        console.error('❌ Error loading workouts:', error);
        return [];
    }
}

// ============================================
// READ - Get workout by ID
// ============================================
export function getWorkoutById(id) {
    const workouts = getAllWorkouts();
    return workouts.find(workout => workout.id === id);
}

// ============================================
// UPDATE - Modify existing workout
// ============================================
export function updateWorkout(id, updatedData) {
    try {
        const workouts = getAllWorkouts();
        const index = workouts.findIndex(w => w.id === id);
        
        if (index === -1) {
            throw new Error('Workout not found');
        }
        
        // Update workout with new data
        workouts[index] = {
            ...workouts[index],
            exercise: sanitizeInput(updatedData.exercise),
            duration: parseInt(updatedData.duration),
            calories: parseInt(updatedData.calories),
            type: updatedData.type,
            notes: updatedData.notes || workouts[index].notes || '',
            lastModified: Date.now()
        };
        
        // Validate updated workout
        if (!validateWorkout(workouts[index])) {
            throw new Error('Invalid workout data after update');
        }
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
        
        console.log('✅ Workout updated:', workouts[index]);
        return workouts[index];
    } catch (error) {
        console.error('❌ Error updating workout:', error);
        throw error;
    }
}

// ============================================
// DELETE - Remove workout
// ============================================
export function deleteWorkout(id) {
    try {
        const workouts = getAllWorkouts();
        const filteredWorkouts = workouts.filter(w => w.id !== id);
        
        if (workouts.length === filteredWorkouts.length) {
            throw new Error('Workout not found');
        }
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredWorkouts));
        
        console.log('✅ Workout deleted:', id);
        return true;
    } catch (error) {
        console.error('❌ Error deleting workout:', error);
        throw error;
    }
}

// ============================================
// DELETE - Clear all workouts
// ============================================
export function clearAllWorkouts() {
    try {
        const confirm = window.confirm(
            'Are you sure you want to delete ALL workouts?\n\n' +
            'This action cannot be undone!'
        );
        
        if (!confirm) {
            return false;
        }
        
        localStorage.removeItem(STORAGE_KEY);
        console.log('✅ All workouts cleared');
        return true;
    } catch (error) {
        console.error('❌ Error clearing workouts:', error);
        throw error;
    }
}

// ============================================
// VALIDATION
// ============================================
function validateWorkout(workout) {
    return (
        workout &&
        typeof workout.id === 'string' &&
        workout.id.length > 0 &&
        typeof workout.exercise === 'string' &&
        workout.exercise.length > 0 &&
        workout.exercise.length <= 100 &&
        typeof workout.duration === 'number' &&
        workout.duration > 0 &&
        workout.duration <= 500 &&
        typeof workout.calories === 'number' &&
        workout.calories > 0 &&
        workout.calories <= 10000 &&
        ['cardio', 'strength', 'flexibility'].includes(workout.type) &&
        typeof workout.timestamp === 'number' &&
        workout.timestamp > 0
    );
}

function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    return input.trim().substring(0, 100);
}

// ============================================
// STORAGE VERSION MANAGEMENT
// ============================================
function checkStorageVersion() {
    const currentVersion = localStorage.getItem(VERSION_KEY);
    
    if (!currentVersion) {
        // First time user
        localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
        console.log('✅ Storage version initialized:', STORAGE_VERSION);
    } else if (currentVersion !== STORAGE_VERSION) {
        // Migration needed
        console.log(`🔄 Migrating data from ${currentVersion} to ${STORAGE_VERSION}`);
        migrateData(currentVersion, STORAGE_VERSION);
        localStorage.setItem(VERSION_KEY, STORAGE_VERSION);
    }
}

function migrateData(fromVersion, toVersion) {
    console.log(`Migration: ${fromVersion} → ${toVersion}`);
    
    // Example migration logic
    if (fromVersion === '1.0' && toVersion === '2.0') {
        const workouts = getAllWorkouts();
        
        // Add new fields to old workouts
        const migratedWorkouts = workouts.map(workout => ({
            ...workout,
            notes: workout.notes || '',
            lastModified: workout.lastModified || workout.timestamp
        }));
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedWorkouts));
        console.log('✅ Migration complete');
    }
}

// ============================================
// STORAGE STATISTICS
// ============================================
export function getStorageStats() {
    try {
        const workouts = getAllWorkouts();
        const data = JSON.stringify(workouts);
        const sizeInBytes = new Blob([data]).size;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        
        // Calculate localStorage usage
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        
        const totalSizeKB = (totalSize / 1024).toFixed(2);
        const percentUsed = ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2);
        
        return {
            totalWorkouts: workouts.length,
            workoutDataSize: sizeInBytes,
            sizeInKB,
            sizeInMB,
            totalStorageKB: totalSizeKB,
            percentUsed,
            isNearLimit: parseFloat(percentUsed) > 80,
            oldestWorkout: workouts[workouts.length - 1]?.date || 'N/A',
            newestWorkout: workouts[0]?.date || 'N/A'
        };
    } catch (error) {
        console.error('❌ Error calculating storage stats:', error);
        return {
            totalWorkouts: 0,
            sizeInKB: '0',
            sizeInMB: '0',
            percentUsed: '0',
            isNearLimit: false
        };
    }
}

function checkStorageQuota(workouts) {
    const dataSize = new Blob([JSON.stringify(workouts)]).size;
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB warning threshold
    
    if (dataSize > maxSize) {
        console.warn('⚠️ Storage nearly full!');
        alert(
            'Storage is nearly full!\n\n' +
            'Consider exporting your data and deleting old workouts.'
        );
    }
}

// ============================================
// EXPORT/IMPORT FUNCTIONS
// ============================================
export function exportWorkoutsToJSON() {
    try {
        const workouts = getAllWorkouts();
        const stats = getStorageStats();
        
        const exportData = {
            version: STORAGE_VERSION,
            exportDate: new Date().toISOString(),
            totalWorkouts: workouts.length,
            stats: stats,
            workouts: workouts
        };
        
        return JSON.stringify(exportData, null, 2);
    } catch (error) {
        console.error('❌ Error exporting workouts:', error);
        throw error;
    }
}

export function importWorkoutsFromJSON(jsonString) {
    try {
        const importData = JSON.parse(jsonString);
        
        // Validate import data
        if (!importData.workouts || !Array.isArray(importData.workouts)) {
            throw new Error('Invalid import file format');
        }
        
        // Validate each workout
        const validWorkouts = importData.workouts.filter(validateWorkout);
        
        if (validWorkouts.length === 0) {
            throw new Error('No valid workouts found in import file');
        }
        
        // Ask user if they want to merge or replace
        const merge = window.confirm(
            `Found ${validWorkouts.length} valid workouts.\n\n` +
            `Click OK to MERGE with existing data\n` +
            `Click Cancel to REPLACE all data`
        );
        
        let finalWorkouts;
        if (merge) {
            const existingWorkouts = getAllWorkouts();
            finalWorkouts = [...validWorkouts, ...existingWorkouts];
            
            // Remove duplicates based on timestamp
            const uniqueWorkouts = Array.from(
                new Map(finalWorkouts.map(w => [w.timestamp, w])).values()
            );
            finalWorkouts = uniqueWorkouts.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            finalWorkouts = validWorkouts;
        }
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalWorkouts));
        
        console.log('✅ Import complete:', finalWorkouts.length, 'workouts');
        return {
            success: true,
            imported: validWorkouts.length,
            total: finalWorkouts.length
        };
    } catch (error) {
        console.error('❌ Error importing workouts:', error);
        throw error;
    }
}

// ============================================
// SETTINGS MANAGEMENT
// ============================================
export function getSettings() {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        if (!data) {
            return getDefaultSettings();
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error loading settings:', error);
        return getDefaultSettings();
    }
}

export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        console.log('✅ Settings saved:', settings);
        return true;
    } catch (error) {
        console.error('❌ Error saving settings:', error);
        return false;
    }
}

function getDefaultSettings() {
    return {
        theme: 'light',
        autoRefreshQuote: true,
        showNotifications: true,
        defaultWorkoutType: 'cardio',
        warningThreshold: 80
    };
}

// ============================================
// SEARCH AND FILTER
// ============================================
export function searchWorkouts(query) {
    const workouts = getAllWorkouts();
    const lowerQuery = query.toLowerCase();
    
    return workouts.filter(workout => 
        workout.exercise.toLowerCase().includes(lowerQuery) ||
        workout.type.toLowerCase().includes(lowerQuery) ||
        (workout.notes && workout.notes.toLowerCase().includes(lowerQuery))
    );
}

export function filterWorkoutsByDateRange(startDate, endDate) {
    const workouts = getAllWorkouts();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return workouts.filter(workout => {
        const workoutDate = new Date(workout.date).getTime();
        return workoutDate >= start && workoutDate <= end;
    });
}

export function filterWorkoutsByType(type) {
    const workouts = getAllWorkouts();
    return workouts.filter(workout => workout.type === type);
}

// ============================================
// BACKUP FUNCTIONS
// ============================================
export function createBackup() {
    try {
        const backup = {
            workouts: localStorage.getItem(STORAGE_KEY),
            settings: localStorage.getItem(SETTINGS_KEY),
            version: localStorage.getItem(VERSION_KEY),
            timestamp: Date.now()
        };
        
        localStorage.setItem('fittrack_backup', JSON.stringify(backup));
        console.log('✅ Backup created');
        return true;
    } catch (error) {
        console.error('❌ Error creating backup:', error);
        return false;
    }
}

export function restoreBackup() {
    try {
        const backupData = localStorage.getItem('fittrack_backup');
        if (!backupData) {
            throw new Error('No backup found');
        }
        
        const backup = JSON.parse(backupData);
        
        const confirm = window.confirm(
            'Restore backup from:\n' +
            new Date(backup.timestamp).toLocaleString() + '\n\n' +
            'This will replace all current data!'
        );
        
        if (!confirm) {
            return false;
        }
        
        localStorage.setItem(STORAGE_KEY, backup.workouts);
        localStorage.setItem(SETTINGS_KEY, backup.settings);
        localStorage.setItem(VERSION_KEY, backup.version);
        
        console.log('✅ Backup restored');
        return true;
    } catch (error) {
        console.error('❌ Error restoring backup:', error);
        return false;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function generateId() {
    return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// ============================================
// INITIALIZE ON LOAD
// ============================================
(function initialize() {
    checkStorageVersion();
    console.log('💾 Workout Manager initialized');
})();