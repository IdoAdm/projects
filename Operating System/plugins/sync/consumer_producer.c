#define _GNU_SOURCE
#include "consumer_producer.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

static pthread_mutex_t g_cp_lock = PTHREAD_MUTEX_INITIALIZER;

/**
 * Initialize a consumer-producer queue
 * Allocates memory for circular buffer and initializes all synchronization primitives
 * @param queue Pointer to queue structure to initialize
 * @param capacity Maximum number of items the queue can hold (must be > 0)
 * @return NULL on success, error message string on failure
 */
const char* consumer_producer_init(consumer_producer_t* queue, int capacity) {
    /* Step 1: Validate input parameters */
    if (!queue) {
        return "Queue pointer cannot be NULL";
    }
    
    if (capacity <= 0) {
        return "Capacity must be greater than 0";
    }
    
    /* Step 2: Initialize basic fields first (set to safe defaults) */
    queue->items = NULL;        /* Initialize to NULL for safe cleanup on failure */
    queue->capacity = capacity; /* Store the requested capacity */
    queue->count = 0;          /* Queue starts empty */
    queue->head = 0;           /* First item index (for consumer) */
    queue->tail = 0;           /* Next insertion index (for producer) */
    
    /* Step 3: Allocate memory for the circular buffer array */
    queue->items = (char**)malloc(capacity * sizeof(char*));
    if (!queue->items) {
        return "Failed to allocate memory for queue items";
    }
    
    /* Step 4: Initialize all array elements to NULL for safety */
    for (int i = 0; i < capacity; i++) {
        queue->items[i] = NULL;
    }
    
    /* Step 5: Initialize synchronization monitors (with error handling) */
    
    /* Initialize not_full_monitor - signaled when queue has space */
    if (monitor_init(&queue->not_full_monitor) != 0) {
        /* Cleanup on failure */
        free(queue->items);
        queue->items = NULL;
        return "Failed to initialize not_full_monitor";
    }
    
    /* Initialize not_empty_monitor - signaled when queue has items */
    if (monitor_init(&queue->not_empty_monitor) != 0) {
        /* Cleanup previously initialized monitor and memory */
        monitor_destroy(&queue->not_full_monitor);
        free(queue->items);
        queue->items = NULL;
        return "Failed to initialize not_empty_monitor";
    }
    
    /* Initialize finished_monitor - signaled when processing is finished */
    if (monitor_init(&queue->finished_monitor) != 0) {
        /* Cleanup all previously initialized monitors and memory */
        monitor_destroy(&queue->not_empty_monitor);
        monitor_destroy(&queue->not_full_monitor);
        free(queue->items);
        queue->items = NULL;
        return "Failed to initialize finished_monitor";
    }
    
    /* Step 6: Set initial monitor states */
    /* Queue starts empty, so it has space available -> signal not_full_monitor */
    monitor_signal(&queue->not_full_monitor);
    
    /* Queue starts empty, so no items available -> do NOT signal not_empty_monitor */
    /* Processing hasn't finished yet -> do NOT signal finished_monitor */
    
    /* Step 7: Success! */
    return NULL;
}


/**
 * Destroy a consumer-producer queue and free its resources
 * Should only be called when no threads are actively using the queue
 * @param queue Pointer to queue structure to destroy
 */
void consumer_producer_destroy(consumer_producer_t* queue) {
    if (!queue) return;

    /* wake any waiters so destroy won't deadlock them */
    monitor_signal(&queue->finished_monitor);
    monitor_signal(&queue->not_empty_monitor);
    monitor_signal(&queue->not_full_monitor);

    /* free leftover items under lock */
    pthread_mutex_lock(&g_cp_lock);
    if (queue->items) {
        for (int i = 0; i < queue->capacity; i++) {
            if (queue->items[i]) {
                free(queue->items[i]);
                queue->items[i] = NULL;
            }
        }
        free(queue->items);
        queue->items = NULL;
    }
    queue->capacity = 0;
    queue->count = 0;
    queue->head = 0;
    queue->tail = 0;
    pthread_mutex_unlock(&g_cp_lock);

    monitor_destroy(&queue->finished_monitor);
    monitor_destroy(&queue->not_empty_monitor);
    monitor_destroy(&queue->not_full_monitor);
}

/**
 * Add an item to the queue (producer).
 * Blocks if queue is full.
 * @param queue Pointer to queue structure
 * @param item String to add (queue takes ownership)
 * @return NULL on success, error message on failure
 */
const char* consumer_producer_put(consumer_producer_t* queue, const char* item) {
    if (!queue) return "Queue is NULL";
    if (!item)  return "Item is NULL";

    while (1) {
        pthread_mutex_lock(&g_cp_lock);

        /* Reject puts after finish was signaled */
        if (queue->finished_monitor.signaled) {
            pthread_mutex_unlock(&g_cp_lock);
            return "Queue already finished";
        }

        /* Space available? Enqueue now */
        if (queue->count < queue->capacity) {
            /* copy under the lock (simple & safe) */
            size_t len = strlen(item) + 1;
            char* copy = (char*)malloc(len);
            if (!copy) {
                pthread_mutex_unlock(&g_cp_lock);
                return "Out of memory";
            }
            memcpy(copy, item, len);

            int was_empty = (queue->count == 0);

            queue->items[queue->tail] = copy;
            queue->tail = (queue->tail + 1) % queue->capacity;
            queue->count++;

            int now_full = (queue->count == queue->capacity);

            /* --- UPDATE MONITORS INSIDE THE LOCK --- */
            if (was_empty) {
                /* became non-empty: wake any waiting consumer */
                monitor_signal(&queue->not_empty_monitor);
            }
            if (now_full) {
                /* became full: block producers */
                monitor_reset(&queue->not_full_monitor);
            } else {
                /* still space: keep producers unblocked */
                monitor_signal(&queue->not_full_monitor);
            }

            pthread_mutex_unlock(&g_cp_lock);
            return NULL; /* success */
        }

        /* full: release lock and wait for space */
        pthread_mutex_unlock(&g_cp_lock);

        /* If finished was signaled while we were unlocked, retun */
        if (queue->finished_monitor.signaled) {
            return "Queue finished while waiting";
        }

        /* Wait for space- monitor_wait blocks (no busy-wait) */
        if (monitor_wait(&queue->not_full_monitor) != 0) {
            return "Monitor wait failed";
        }
        /* loop & retry */
    }
}


/**
 * Remove an item from the queue (consumer) and returns it.
 * Blocks if queue is empty.
 * @param queue Pointer to queue structure
 * @return String item or NULL if queue is empty and finished
 */
char* consumer_producer_get(consumer_producer_t* queue) {
    if (!queue) return NULL;

    while (1) {
        pthread_mutex_lock(&g_cp_lock);

        /* If finished and drained, we're done */
        if (queue->finished_monitor.signaled && queue->count == 0) {
            pthread_mutex_unlock(&g_cp_lock);
            return NULL;
        }

        /* Have an item? Dequeue now */
        if (queue->count > 0) {
            char* item = queue->items[queue->head];
            queue->items[queue->head] = NULL;

            int was_full = (queue->count == queue->capacity);

            queue->head = (queue->head + 1) % queue->capacity;
            queue->count--;

            int now_empty = (queue->count == 0);

            if (was_full) {
                /* there is space now: wake a producer */
                monitor_signal(&queue->not_full_monitor);
            }
            if (now_empty) {
                /* became empty: consumers should block */
                monitor_reset(&queue->not_empty_monitor);
            } else {
                /* still items available: keep consumers unblocked */
                monitor_signal(&queue->not_empty_monitor);
            }

            pthread_mutex_unlock(&g_cp_lock);
            return item; /* caller owns & must free */
        }

        /* empty: release lock and decide whether to sleep */
        pthread_mutex_unlock(&g_cp_lock);

        /* If finish already signaled, don't sleep—return NULL */
        if (queue->finished_monitor.signaled) {
            return NULL;
        }

        /* Wait for items; monitor_wait blocks (no busy-wait) */
        if (monitor_wait(&queue->not_empty_monitor) != 0) {
            return NULL;
        }
        /* loop & retry */
    }
}


/**
 * Signal that processing is finished
 * Wakes up any consumers waiting on empty queue so they can terminate
 * @param queue Pointer to queue structure
 */
void consumer_producer_signal_finished(consumer_producer_t* queue) {
    if (!queue) return;

    /* Mark finished and wake everyone who might be waiting. */
    monitor_signal(&queue->finished_monitor);

    /* Unblock consumers waiting for not-empty so they can notice finished. */
    monitor_signal(&queue->not_empty_monitor);

    /* Unblock producers waiting for not-full so they won't hang on shutdown. */
    monitor_signal(&queue->not_full_monitor);
}

/**
 * Wait for the consumer-producer queue to finish processing.
 *
 * This function blocks the calling thread until the queue's
 * finished monitor is signaled via consumer_producer_signal_finished().
 * Used during graceful shutdown to ensure all work has been processed.
 *
 * @param queue Pointer to the consumer-producer queue structure.
 *              Must not be NULL.
 *
 * @return 0 on success (finished signal received),
 *        -1 if queue is NULL or if monitor_wait() fails.
 */
int consumer_producer_wait_finished(consumer_producer_t* queue) {
    if (!queue) {
        return -1;  // Error: invalid queue pointer
    }

    // Block until the finished signal is received
    if (monitor_wait(&queue->finished_monitor) != 0) {
        return -1;  // Error: monitor wait failed
    }

    return 0; // Finished signal received successfully
}