/**
 * Expander Plugin - Inserts a single white space between each character in the string
 * 
 * This plugin takes an input string and inserts a space between each character.
 * For example: "hello" becomes "h e l l o"
 */

#define _GNU_SOURCE
#include "plugin_common.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * Transform function for the expander plugin
 * Inserts spaces between each character in the input string
 * 
 * @param input The input string to expand with spaces
 * @return A new string with spaces between characters (caller owns the memory)
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
            fprintf(stderr, "[ERROR][expander] Failed to allocate memory for empty string\n");
            return NULL;
        }
        output[0] = '\0';
        return output;
    }
    
    // Handle single character case (no spaces to insert)
    if (len == 1) {
        char* output = strdup(input);
        if (!output) {
            fprintf(stderr, "[ERROR][expander] Failed to allocate memory for single character\n");
            return NULL;
        }
        return output;
    }
    
    // Calculate output size: original length + (length-1) spaces + null terminator
    // For "hello" (5 chars): 5 + 4 spaces + 1 null = 10 chars total
    size_t output_len = len + (len - 1);
    
    // Allocate memory for the output string
    char* output = malloc(output_len + 1);
    if (!output) {
        fprintf(stderr, "[ERROR][expander] Failed to allocate memory for output string\n");
        return NULL;
    }
    
    // Build the expanded string
    size_t output_index = 0;
    
    for (size_t i = 0; i < len; i++) {
        // Add the current character
        output[output_index++] = input[i];
        
        // Add a space after each character except the last one
        if (i < len - 1) {
            output[output_index++] = ' ';
        }
    }
    
    // Null-terminate the output string
    output[output_index] = '\0';
    
    return output;
}

/**
 * Initialize the expander plugin
 * Calls the common plugin initialization with our transform function
 * 
 * @param queue_size Maximum number of items that can be queued
 * @return NULL on success, error message on failure
 */
__attribute__((visibility("default")))
const char* plugin_init(int queue_size) {
    return common_plugin_init(plugin_transform, "expander", queue_size);
}