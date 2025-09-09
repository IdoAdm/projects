#define _GNU_SOURCE
#include "plugin_common.h"
#include "sync/consumer_producer.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

plugin_context_t global_context = {0}; // defined globally and zero-initialized

pthread_mutex_t plugin_state_mutex = PTHREAD_MUTEX_INITIALIZER;

/* Static variable to store the plugin's name */
static const char* current_plugin_name = "GenericPlugin";

void* plugin_consumer_thread(void* arg) {
    if (!arg) return NULL;

    plugin_context_t* context = (plugin_context_t*)arg;
    if (!context->queue || !context->process_function) return NULL;

    while (1) {
        char* input = consumer_producer_get(context->queue);

        /* Queue drained after finish -> all work done */
        if (!input) {
            consumer_producer_signal_finished(context->queue);
            pthread_mutex_lock(&plugin_state_mutex);
            context->finished = 1;
            pthread_mutex_unlock(&plugin_state_mutex);
            break;
        }

        /* Special shutdown marker: DO NOT process/print */
        if (strcmp(input, "<END>") == 0) {
            if (context->next_place_work) {
                const char* err = context->next_place_work("<END>");
                if (err) {
                    if (context->name) {
                        fprintf(stderr, "[ERROR][%s] Failed to forward <END>: %s\n",
                                context->name, err);
                    } else {
                        fprintf(stderr, "[ERROR][Unknown] Failed to forward <END>: %s\n",
                                err);
                    }
                }
            }

            /* always own the dequeued buffer */
            free(input);

            consumer_producer_signal_finished(context->queue);
            pthread_mutex_lock(&plugin_state_mutex);
            context->finished = 1;
            pthread_mutex_unlock(&plugin_state_mutex);
            break;
        }

        const char* processed = context->process_function(input);

        /* Forward to next plugin if exists */
        if (processed && context->next_place_work) {
            const char* err = context->next_place_work(processed);
            if (err) {
                if (context->name) {
                    fprintf(stderr, "[ERROR][%s] Failed to forward: %s\n",
                            context->name, err);
                } else {
                    fprintf(stderr, "[ERROR][Unknown] Failed to forward: %s\n", err);
                }
            }
        }

        /* Free what we own */
        if (processed && processed != input) {
            free((void*)processed);
        }
        free(input);
    }

    return NULL;
}

/**
 * Print error message in the format [ERROR][Plugin Name] - message
 * @param context Plugin context (may be NULL for generic errors)
 * @param message Error message to print (may be NULL)
 */
void log_error(plugin_context_t* context, const char* message) {
    /* Step 1: Handle NULL context case */
    const char* plugin_name;
    if (!context) {
        plugin_name = "Unknown"; /* Default name when context is NULL */
    } else if (!context->name) {
        plugin_name = "Unnamed"; /* Default name when context->name is NULL */
    } else {
        plugin_name = context->name; /* Use the actual plugin name */
    }
    
    /* Step 2: Handle NULL message case */
    const char* error_message;
    if (!message) {
        error_message = "Unknown error"; /* Default message when message is NULL */
    } else if (strlen(message) == 0) {
        error_message = "Empty error message"; /* Handle empty string */
    } else {
        error_message = message; /* Use the actual message */
    }
    
    /* Step 3: Print formatted error message to stderr */
    /* Format: [ERROR][Plugin Name] - message */
    fprintf(stderr, "[ERROR][%s] - %s\n", plugin_name, error_message);
    
    /* Step 4: Flush stderr to ensure immediate output */
    /* This is important for debugging - errors should appear immediately */
    fflush(stderr);
}

/**
 * Print info message in the format [INFO][Plugin Name] - message
 * @param context Plugin context (may be NULL for generic info)
 * @param message Info message to print (may be NULL)
 */
void log_info(plugin_context_t* context, const char* message) {
    /* Step 1: Handle NULL context case */
    const char* plugin_name;
    if (!context) {
        plugin_name = "Unknown"; /* Default name when context is NULL */
    } else if (!context->name) {
        plugin_name = "Unnamed"; /* Default name when context->name is NULL */
    } else {
        plugin_name = context->name; /* Use the actual plugin name */
    }
    
    /* Step 2: Handle NULL message case */
    const char* info_message;
    if (!message) {
        info_message = "Unknown info"; /* Default message when message is NULL */
    } else if (strlen(message) == 0) {
        info_message = "Empty info message"; /* Handle empty string */
    } else {
        info_message = message; /* Use the actual message */
    }
    
    /* Step 3: Print formatted info message to stdout */
    /* Format: [INFO][Plugin Name] - message */
    printf("[INFO][%s] - %s\n", plugin_name, info_message);
    
    /* Step 4: Flush stdout to ensure immediate output */
    /* This is important for real-time logging - info should appear immediately */
    fflush(stdout);
}

const char* common_plugin_init(const char* (*process_function)(const char*),
                                const char* name, int queue_size) {
    // Validate arguments
    if (!process_function) return "process_function is NULL";
    if (!name || strlen(name) == 0) return "Plugin name is NULL or empty";
    if (queue_size <= 0) return "Queue size must be positive";

    // Check if already initialized (with thread safety)
    pthread_mutex_lock(&plugin_state_mutex);
    if (global_context.initialized) {
        pthread_mutex_unlock(&plugin_state_mutex);
        return "Plugin already initialized";
    }
    pthread_mutex_unlock(&plugin_state_mutex);

    // Make a copy of the name (Issue #1 fix)
    char* name_copy = strdup(name);
    if (!name_copy) {
        return "Failed to allocate memory for plugin name";
    }

    // Set name for plugin_get_name()
    plugin_set_name_internal(name);

    // Assign name and function
    global_context.name = name_copy;  // Now we own this memory
    global_context.process_function = process_function;

    // Allocate memory for queue
    global_context.queue = malloc(sizeof(consumer_producer_t));
    if (!global_context.queue) {
        free(name_copy);
        return "Failed to allocate memory for queue";
    }

    // Initialize the queue
    const char* init_err = consumer_producer_init(global_context.queue, queue_size);
    if (init_err) {
        free(global_context.queue);
        global_context.queue = NULL;
        free(name_copy);
        return init_err;
    }

    // Set other plugin context fields
    pthread_mutex_lock(&plugin_state_mutex);
    global_context.initialized = 1;
    global_context.finished = 0;
    pthread_mutex_unlock(&plugin_state_mutex);
    
    global_context.next_place_work = NULL;

    // Start the consumer thread
    int rc = pthread_create(&global_context.consumer_thread, NULL, plugin_consumer_thread, &global_context);
    if (rc != 0) {
        // Complete cleanup on failure (Issue #4 fix)
        consumer_producer_destroy(global_context.queue);
        free(global_context.queue);
        global_context.queue = NULL;
        
        free((void*)global_context.name);
        global_context.name = NULL;
        
        // Reset initialized flag - key fix for issue #4
        pthread_mutex_lock(&plugin_state_mutex);
        global_context.initialized = 0;
        pthread_mutex_unlock(&plugin_state_mutex);
        
        return "Failed to create consumer thread";
    }

    return NULL;  // success
}

/**
 * Finalize the plugin - drain queue and terminate thread gracefully
 * @return NULL on success, error message on failure
 */
__attribute__((visibility("default")))
const char* plugin_fini(void) {
    consumer_producer_t* q = NULL;
    char* name_to_free = NULL;
    pthread_t thread_to_join = 0;

    /* If not initialized, no-op (idempotent success) */
    pthread_mutex_lock(&plugin_state_mutex);
    if (!global_context.initialized) {
        pthread_mutex_unlock(&plugin_state_mutex);
        return NULL;
    }

    /* Flip the initialized flag; capture pointers */
    global_context.initialized = 0;
    q = global_context.queue;
    name_to_free = (char*)global_context.name;
    thread_to_join = global_context.consumer_thread;
    pthread_mutex_unlock(&plugin_state_mutex);

    /* CRITICAL: Signal the queue to finish BEFORE joining thread */
    if (q) {
        consumer_producer_signal_finished(q);
    }

    /* Now join the consumer thread - it should exit gracefully */
    if (thread_to_join) {
        pthread_join(thread_to_join, NULL);
    }

    /* Destroy queue and free struct we allocated in init */
    if (q) {
        consumer_producer_destroy(q);
        free(q);
        q = NULL;
    }

    /* Free copied plugin name */
    if (name_to_free) {
        free(name_to_free);
        name_to_free = NULL;
    }

    /* Now clear remaining fields */
    pthread_mutex_lock(&plugin_state_mutex);
    global_context.queue = NULL;
    global_context.consumer_thread = 0;
    global_context.name = NULL;
    global_context.process_function = NULL;
    global_context.next_place_work = NULL;
    global_context.finished = 0;
    pthread_mutex_unlock(&plugin_state_mutex);

    /* Reset public-facing name */
    plugin_set_name_internal("GenericPlugin");

    return NULL;
}


/**
 * Place work (a string) into the plugin's queue
 * @param str The string to process (plugin takes ownership if it allocates memory)
 * @return NULL on success, error message on failure
 */
const char* plugin_place_work(const char* str) {
    // Validate input
    if (!str) {
        return "Input string is NULL";
    }
    
    // Check if plugin is initialized
    pthread_mutex_lock(&plugin_state_mutex);
    if (!global_context.initialized) {
        pthread_mutex_unlock(&plugin_state_mutex);
        return "Plugin not initialized";
    }
    
    if (!global_context.queue) {
        pthread_mutex_unlock(&plugin_state_mutex);
        return "Plugin queue not available";
    }
    
    // Check if plugin is finished
    if (global_context.finished) {
        pthread_mutex_unlock(&plugin_state_mutex);
        return "Plugin has finished processing";
    }
    
    // Get queue pointer while holding lock
    consumer_producer_t* queue_ptr = global_context.queue;
    pthread_mutex_unlock(&plugin_state_mutex);
    
    // FIXED: Pass the original string directly - let consumer_producer_put handle copying
    const char* put_result = consumer_producer_put(queue_ptr, str);
    
    if (put_result) {
        log_error(&global_context, "Failed to place work in queue");
        return put_result;
    }
    
    // Success
    return NULL;
}

/**
 * Attach this plugin to the next plugin in the chain
 * @param next_place_work Function pointer to the next plugin's place_work function
 */
__attribute__((visibility("default")))
void plugin_attach(const char* (*next_place_work)(const char*)) {
    
    pthread_mutex_lock(&plugin_state_mutex);
    
    // Store the next plugin's place_work function pointer
    // NULL is valid (indicates this is the last plugin in the chain)
    global_context.next_place_work = next_place_work;
    
    pthread_mutex_unlock(&plugin_state_mutex);
}

/**
 * Wait until the plugin has finished processing all work and is ready to shut down.
 *
 * This function waits for the plugin to signal that it has finished processing
 * all work items and is ready for shutdown. It should be called after sending
 * the <END> signal but before calling plugin_fini().
 *
 * @return NULL on success; a const error message string on failure.
 */
__attribute__((visibility("default")))
const char* plugin_wait_finished(void) {
    consumer_producer_t* queue_ptr = NULL;
    int is_initialized;

    // Check if plugin is initialized and get queue pointer
    pthread_mutex_lock(&plugin_state_mutex);
    is_initialized = global_context.initialized;
    queue_ptr = global_context.queue;
    pthread_mutex_unlock(&plugin_state_mutex);

    if (!is_initialized) {
        return "plugin_wait_finished: plugin not initialized";
    }

    if (!queue_ptr) {
        return "plugin_wait_finished: plugin queue not available";
    }

    // Wait for the consumer thread to signal it's finished processing
    int result = consumer_producer_wait_finished(queue_ptr);
    if (result != 0) {
        return "plugin_wait_finished: failed to wait for completion";
    }

    // Now that processing is finished, join the consumer thread
    pthread_t thread_handle;
    pthread_mutex_lock(&plugin_state_mutex);
    thread_handle = global_context.consumer_thread;
    pthread_mutex_unlock(&plugin_state_mutex);

    if (thread_handle) {
        int rc = pthread_join(thread_handle, NULL);
        if (rc != 0) {
            return "plugin_wait_finished: pthread_join failed";
        }
        
        // Clear the thread handle to indicate it's been joined
        pthread_mutex_lock(&plugin_state_mutex);
        global_context.consumer_thread = 0;
        pthread_mutex_unlock(&plugin_state_mutex);
    }

    return NULL; // Success
}


__attribute__((visibility("default")))
const char* plugin_get_name(void) {
    // First try to get name from global_context (set by common_plugin_init)
    if (global_context.name) {
        return global_context.name;
    }
    
    // Then try the static name if it's been set
    if (current_plugin_name && strcmp(current_plugin_name, "GenericPlugin") != 0) {
        return current_plugin_name;
    }
    
    // Final fallback
    return "GenericPlugin";
}

void plugin_set_name_internal(const char* name) {
    if (name) {
        current_plugin_name = name;
    }
}