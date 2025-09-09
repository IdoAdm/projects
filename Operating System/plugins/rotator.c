/**
 * Rotator Plugin - Moves every character in the string one position to the right
 * 
 * This plugin takes an input string and rotates all characters one position
 * to the right, with the last character wrapping around to the front.
 * For example: "hello" becomes "ohell"
 */

#define _GNU_SOURCE
#include "plugin_common.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * Transform function for the rotator plugin
 * Rotates characters one position to the right with wraparound
 * 
 * @param input The input string to rotate
 * @return A new string with characters rotated right (caller owns the memory)
 */
const char* plugin_transform(const char* input) {
    // Validate input
    if (!input) {
        return NULL;
    }
    
    // Get the length of the input string
    size_t len = strlen(input);
    
    // Handle empty string or single character case
    if (len <= 1) {
        char* output = strdup(input);
        if (!output) {
            fprintf(stderr, "[ERROR][rotator] Failed to allocate memory for output string\n");
            return NULL;
        }
        return output;
    }
    
    // Allocate memory for the output string (same size as input + null terminator)
    char* output = malloc(len + 1);
    if (!output) {
        fprintf(stderr, "[ERROR][rotator] Failed to allocate memory for output string\n");
        return NULL;
    }
    
    // Rotate right: last character becomes first, all others shift right
    // Example: "hello" -> "ohell"
    // output[0] = input[len-1] (last char becomes first)
    // output[i] = input[i-1] for i > 0 (shift everything else right)
    
    output[0] = input[len - 1];  // Last character wraps to front
    
    for (size_t i = 1; i < len; i++) {
        output[i] = input[i - 1];  // Shift all other characters right
    }
    
    // Null-terminate the output string
    output[len] = '\0';
    
    return output;
}

/**
 * Initialize the rotator plugin
 * Calls the common plugin initialization with our transform function
 * 
 * @param queue_size Maximum number of items that can be queued
 * @return NULL on success, error message on failure
 */
__attribute__((visibility("default")))
const char* plugin_init(int queue_size) {
    return common_plugin_init(plugin_transform, "rotator", queue_size);
}