#include "monitor.h"
#include <errno.h>
#include <stdio.h>
#include <string.h>

/**
 * Initialize a monitor structure
 * Sets up mutex, condition variable, and resets signaled state
 */
int monitor_init(monitor_t* monitor) {
    if (!monitor) {
        return -1;
    }
    
    // Initialize mutex with default attributes
    int result = pthread_mutex_init(&monitor->mutex, NULL);
    if (result != 0) {
        fprintf(stderr, "monitor_init: Failed to initialize mutex: %s\n", strerror(result));
        return -1;
    }
    
    // Initialize condition variable with default attributes
    result = pthread_cond_init(&monitor->condition, NULL);
    if (result != 0) {
        fprintf(stderr, "monitor_init: Failed to initialize condition variable: %s\n", strerror(result));
        pthread_mutex_destroy(&monitor->mutex);
        return -1;
    }
    
    // Initialize to non-signaled state
    monitor->signaled = 0;
    
    return 0;
}

/**
 * Destroy a monitor and free its resources
 * Cleans up mutex and condition variable resources
 */
void monitor_destroy(monitor_t* monitor) {
    if (!monitor) {
        return;
    }
    
    // Destroy condition variable and mutex
    int result = pthread_cond_destroy(&monitor->condition);
    if (result != 0) {
        fprintf(stderr, "monitor_destroy: Warning - failed to destroy condition variable: %s\n", strerror(result));
    }
    
    result = pthread_mutex_destroy(&monitor->mutex);
    if (result != 0) {
        fprintf(stderr, "monitor_destroy: Warning - failed to destroy mutex: %s\n", strerror(result));
    }
    
    // Reset state for safety (though struct may be freed after this)
    monitor->signaled = 0;
}

/**
 * Signal a monitor (sets the monitor to signaled state)
 * Wakes up ALL waiting threads and sets the signaled flag
 * Signal persists until manually reset with monitor_reset()
 */
void monitor_signal(monitor_t* monitor) {
    if (!monitor) {
        return;
    }
    
    int result = pthread_mutex_lock(&monitor->mutex);
    if (result != 0) {
        fprintf(stderr, "monitor_signal: Failed to lock mutex: %s\n", strerror(result));
        return;
    }
    
    // Set the signaled flag - this is what makes it "stateful"
    // Signal persists until manually reset
    monitor->signaled = 1;
    
    // Wake up ALL threads waiting on the condition variable
    // Use broadcast for manual reset behavior
    result = pthread_cond_broadcast(&monitor->condition);
    if (result != 0) {
        fprintf(stderr, "monitor_signal: Failed to broadcast condition variable: %s\n", strerror(result));
    }
    
    result = pthread_mutex_unlock(&monitor->mutex);
    if (result != 0) {
        fprintf(stderr, "monitor_signal: Failed to unlock mutex: %s\n", strerror(result));
    }
}

/**
 * Reset a monitor (clears the monitor signaled state)
 * Sets signaled flag to 0, does not wake waiting threads
 * This is the ONLY way to clear the signal in manual reset mode
 */
void monitor_reset(monitor_t* monitor) {
    if (!monitor) {
        return;
    }
    
    int result = pthread_mutex_lock(&monitor->mutex);
    if (result != 0) {
        fprintf(stderr, "monitor_reset: Failed to lock mutex: %s\n", strerror(result));
        return;
    }
    
    // Clear the signaled flag
    monitor->signaled = 0;
    
    result = pthread_mutex_unlock(&monitor->mutex);
    if (result != 0) {
        fprintf(stderr, "monitor_reset: Failed to unlock mutex: %s\n", strerror(result));
    }
}

/**
 * Wait for a monitor to be signaled (infinite wait)
 * MANUAL RESET: Blocks until monitor is signaled, but does NOT consume/reset the signal
 * Signal remains active until explicitly cleared with monitor_reset()
 * If already signaled when called, returns immediately without affecting signal state
 */
int monitor_wait(monitor_t* monitor) {
    if (!monitor) {
        return -1;
    }
    
    int result = pthread_mutex_lock(&monitor->mutex);
    if (result != 0) {
        fprintf(stderr, "monitor_wait: Failed to lock mutex: %s\n", strerror(result));
        return -1;
    }
    
    // Wait until the monitor is signaled
    // The while loop protects against spurious wakeups
    while (!monitor->signaled) {
        // pthread_cond_wait atomically:
        // 1. Releases the mutex
        // 2. Waits for the condition variable to be signaled
        // 3. Re-acquires the mutex before returning
        result = pthread_cond_wait(&monitor->condition, &monitor->mutex);
        if (result != 0) {
            fprintf(stderr, "monitor_wait: Failed to wait on condition variable: %s\n", strerror(result));
            pthread_mutex_unlock(&monitor->mutex);
            return -1;
        }
    }
    
    // MANUAL RESET: Do NOT reset the signal automatically
    // The signal stays active until someone explicitly calls monitor_reset()
    // This allows multiple threads to see the same signal
    
    result = pthread_mutex_unlock(&monitor->mutex);
    if (result != 0) {
        fprintf(stderr, "monitor_wait: Failed to unlock mutex: %s\n", strerror(result));
        return -1;
    }
    
    return 0;
}