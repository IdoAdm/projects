#ifndef MONITOR_H
#define MONITOR_H

#include <pthread.h>

/**
 * Monitor - A stateful synchronization primitive that solves the race condition
 * where signals sent before waiting are lost. Unlike pure condition variables,
 * monitors "remember" their signaled state until consumed by a waiting thread.
 */
typedef struct {
    pthread_mutex_t mutex;      /* Mutex for thread-safe access to signaled flag */
    pthread_cond_t condition;   /* Condition variable for blocking/unblocking threads */
    int signaled;              /* State flag: 1 if signaled, 0 if not signaled */
} monitor_t;

/**
 * Initialize a monitor structure
 * @param monitor Pointer to monitor structure to initialize
 * @return 0 on success, -1 on failure
 */
int monitor_init(monitor_t* monitor);

/**
 * Destroy a monitor and free its resources
 * @param monitor Pointer to monitor structure to destroy
 */
void monitor_destroy(monitor_t* monitor);

/**
 * Signal a monitor (sets the monitor to signaled state)
 * @param monitor Pointer to monitor structure
 */
void monitor_signal(monitor_t* monitor);

/**
 * Reset a monitor (clears the monitor signaled state)
 * @param monitor Pointer to monitor structure
 */
void monitor_reset(monitor_t* monitor);

/**
 * Wait for a monitor to be signaled (infinite wait)
 * @param monitor Pointer to monitor structure
 * @return 0 on success, -1 on error
 */
int monitor_wait(monitor_t* monitor);

#endif /* MONITOR_H */