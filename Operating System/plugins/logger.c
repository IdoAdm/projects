/**
 * Logger Plugin - Logs all strings that pass through to standard output
 * 
 * This plugin simply prints each string it receives with a [logger] prefix
 * and passes the string unchanged to the next plugin in the pipeline.
 */

#define _GNU_SOURCE
#include "plugin_common.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * Transform function for the logger plugin
 * Logs the input string to stdout and returns a copy to pass to next plugin
 * 
 * @param input The input string to log and pass through
 * @return A copy of the input string for the next plugin (caller owns the memory)
 */
const char* plugin_transform(const char* input) {
    // Validate input
    if (!input) {
        return NULL;
    }
    
    // Log the string to stdout with [logger] prefix
    printf("[logger] %s\n", input);
    fflush(stdout);  // Ensure immediate output
    
    // Create a copy of the input string to pass to the next plugin
    // The next plugin (or the common infrastructure) will free this memory
    char* output = strdup(input);
    if (!output) {
        fprintf(stderr, "[ERROR][logger] Failed to allocate memory for output string\n");
        return NULL;
    }
    
    return output;
}

/**
 * Initialize the logger plugin
 * Calls the common plugin initialization with our transform function
 * 
 * @param queue_size Maximum number of items that can be queued
 * @return NULL on success, error message on failure
 */
__attribute__((visibility("default")))
const char* plugin_init(int queue_size) {
    return common_plugin_init(plugin_transform, "logger", queue_size);
}