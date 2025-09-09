#ifndef CONSUMER_PRODUCER_H
#define CONSUMER_PRODUCER_H

#include "monitor.h"

/**
 * Consumer-Producer Queue - Thread-safe bounded queue implementation
 * Uses circular buffer for efficient memory usage and monitors for synchronization
 */
typedef struct {
    char** items;                    /* Array of string pointers (circular buffer) */
    int capacity;                    /* Maximum number of items queue can hold */
    int count;                       /* Current number of items in queue */
    int head;                        /* Index of first item (for get operations) */
    int tail;    
   
    /* Synchronization primitives using monitors */
    monitor_t not_full_monitor;      /* Signaled when queue has space available */
    monitor_t not_empty_monitor;     /* Signaled when queue has items available */
    monitor_t finished_monitor;      /* Signaled when processing is finished */
} consumer_producer_t;

/**
 * Initialize a consumer-producer queue
 * Allocates memory for circular buffer and initializes all synchronization primitives
 * @param queue Pointer to queue structure to initialize
 * @param capacity Maximum number of items the queue can hold (must be > 0)
 * @return NULL on success, error message string on failure
 */
const char* consumer_producer_init(consumer_producer_t* queue, int capacity);

/**
 * Destroy a consumer-producer queue and free its resources
 * Frees circular buffer memory and destroys all synchronization primitives
 * Should only be called when no threads are actively using the queue
 * @param queue Pointer to queue structure to destroy
 */
void consumer_producer_destroy(consumer_producer_t* queue);

/**
 * Add an item to the queue (producer operation)
 * Blocks if queue is full until space becomes available
 * The queue takes ownership of the string pointer
 * @param queue Pointer to queue structure
 * @param item String to add (must not be NULL)
 * @return NULL on success, error message string on failure
 */
const char* consumer_producer_put(consumer_producer_t* queue, const char* item);

/**
 * Remove an item from the queue (consumer operation)
 * Blocks if queue is empty until an item becomes available
 * Caller takes ownership of the returned string
 * @param queue Pointer to queue structure
 * @return String item on success, NULL if queue is empty and finished
 */
char* consumer_producer_get(consumer_producer_t* queue);

/**
 * Signal that no more items will be added to the queue
 * Wakes up any consumers waiting on empty queue so they can terminate
 * @param queue Pointer to queue structure
 */
void consumer_producer_signal_finished(consumer_producer_t* queue);

/**
 * Wait for the finished signal to be set
 * Blocks until signal_finished has been called
 * @param queue Pointer to queue structure
 * @return 0 on success, -1 on error
 */
int consumer_producer_wait_finished(consumer_producer_t* queue);

#endif /* CONSUMER_PRODUCER_H */