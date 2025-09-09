/**
 * Flipper Plugin - Reverses the order of characters in the string
 * 
 * This plugin takes an input string and reverses the order of all characters,
 * then passes the result to the next plugin.
 */

 #define _GNU_SOURCE
#include "plugin_common.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * Transform function for the flipper plugin
 * Reverses the order of characters in the input string
 * 
 * @param input The input string to reverse
 * @return A new string with characters in reverse order (caller owns the memory)
 */
const char* plugin_transform(const char* input) {
    // Validate input
    if (!input) {
        return NULL;
    }
    
    // Get the length of the input string
    size_t len = strlen(input);
    
    // Handle empty string case
    if (len == 0) {
        char* output = malloc(1);
        if (!output) {
            fprintf(stderr, "[ERROR][flipper] Failed to allocate memory for empty string\n");
            return NULL;
        }
        output[0] = '\0';
        return output;
    }
    
    // Allocate memory for the output string (same size as input + null terminator)
    char* output = malloc(len + 1);
    if (!output) {
        fprintf(stderr, "[ERROR][flipper] Failed to allocate memory for output string\n");
        return NULL;
    }
    
    // Reverse the string by copying characters from end to beginning
    for (size_t i = 0; i < len; i++) {
        output[i] = input[len - 1 - i];
    }
    
    // Null-terminate the output string
    output[len] = '\0';
    
    return output;
}

/**
 * Initialize the flipper plugin
 * Calls the common plugin initialization with our transform function
 * 
 * @param queue_size Maximum number of items that can be queued
 * @return NULL on success, error message on failure
 */
__attribute__((visibility("default")))
const char* plugin_init(int queue_size) {
    return common_plugin_init(plugin_transform, "flipper", queue_size);
}