/**
 * Typewriter Plugin - Simulates a typewriter effect by printing each character with a 100ms delay
 * 
 * This plugin takes an input string and prints each character individually with a
 * 100ms delay between characters, simulating a typewriter effect. This can cause
 * a "traffic jam" in the pipeline due to the delays.
 * 
 * Note: This plugin typically appears at the end of a pipeline since it's primarily
 * for output display rather than transformation.
 */

#define _GNU_SOURCE
#include "plugin_common.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>  // for usleep

/**
 * Transform function for the typewriter plugin
 * Prints each character with a 100ms delay and returns a copy of the string
 * 
 * @param input The input string to print with typewriter effect
 * @return A copy of the input string for the next plugin (caller owns the memory)
 */
const char* plugin_transform(const char* input) {
    // Validate input
    if (!input) {
        return NULL;
    }
    
    // Create the prefix string
    const char* prefix = "[typewriter] ";
    
    // Print the prefix with typewriter effect (each character with 100ms delay)
    size_t prefix_len = strlen(prefix);
    for (size_t i = 0; i < prefix_len; i++) {
        putchar(prefix[i]);
        fflush(stdout);  // Ensure immediate output for typewriter effect
        usleep(100000);  // 100ms delay = 100,000 microseconds
    }
    
    // Get the length of the input string
    size_t len = strlen(input);
    
    // Print each character of the input with a 100ms delay
    for (size_t i = 0; i < len; i++) {
        putchar(input[i]);
        fflush(stdout);  // Ensure immediate output for typewriter effect
        usleep(100000);  // 100ms delay = 100,000 microseconds
    }
    
    // Print newline at the end with delay
    putchar('\n');
    fflush(stdout);
    
    // Create a copy of the input string to pass to the next plugin
    char* output = strdup(input);
    if (!output) {
        fprintf(stderr, "[ERROR][typewriter] Failed to allocate memory for output string\n");
        return NULL;
    }
    
    return output;
}

/**
 * Initialize the typewriter plugin
 * Calls the common plugin initialization with our transform function
 * 
 * @param queue_size Maximum number of items that can be queued
 * @return NULL on success, error message on failure
 */
__attribute__((visibility("default")))
const char* plugin_init(int queue_size) {
    return common_plugin_init(plugin_transform, "typewriter", queue_size);
}