/**
 * Uppercaser Plugin - Converts all alphabetic characters in the string to uppercase
 * 
 * This plugin takes an input string and converts all alphabetic characters
 * to their uppercase equivalents, then passes the result to the next plugin.
 */

#include "plugin_common.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

//HELPER FUNCTION: Convert a character to uppercase
static inline char my_toupper(char c) {
    return (c >= 'a' && c <= 'z') ? (c - 32) : c;
}

/**
 * Transform function for the uppercaser plugin
 * Converts all alphabetic characters to uppercase
 * 
 * @param input The input string to convert to uppercase
 * @return A new string with all characters converted to uppercase (caller owns the memory)
 */
const char* plugin_transform(const char* input) {
    // Validate input
    if (!input) {
        return NULL;
    }
    
    // Get the length of the input string
    size_t len = strlen(input);
    
    // Allocate memory for the output string (same size as input + null terminator)
    char* output = malloc(len + 1);
    if (!output) {
        fprintf(stderr, "[ERROR][uppercaser] Failed to allocate memory for output string\n");
        return NULL;
    }
    
    // Convert each character to uppercase
    for (size_t i = 0; i < len; i++) {
        output[i] = my_toupper(input[i]);
    }
    
    // Null-terminate the output string
    output[len] = '\0';
    
    return output;
}

/**
 * Initialize the uppercaser plugin
 * Calls the common plugin initialization with our transform function
 * 
 * @param queue_size Maximum number of items that can be queued
 * @return NULL on success, error message on failure
 */
__attribute__((visibility("default")))
const char* plugin_init(int queue_size) {
    return common_plugin_init(plugin_transform, "uppercaser", queue_size);
}