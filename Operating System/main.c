#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dlfcn.h>
#include <unistd.h>
#include <limits.h>

// Plugin function type definitions
typedef const char* (*plugin_init_func_t)(int queue_size);
typedef const char* (*plugin_fini_func_t)(void);
typedef const char* (*plugin_place_work_func_t)(const char* str);
typedef void (*plugin_attach_func_t)(const char* (*next_place_work)(const char*));
typedef const char* (*plugin_wait_finished_func_t)(void);
typedef const char* (*plugin_get_name_func_t)(void);

// Plugin handle structure
typedef struct {
    plugin_init_func_t init;
    plugin_fini_func_t fini;
    plugin_place_work_func_t place_work;
    plugin_attach_func_t attach;
    plugin_wait_finished_func_t wait_finished;
    plugin_get_name_func_t get_name;
    char* name;
    void* handle;
} plugin_handle_t;

// Function prototypes
void print_usage(void);
void cleanup_plugins(plugin_handle_t* plugins, int count);
int parse_queue_size(const char* arg);
int load_plugin(const char* plugin_name, plugin_handle_t* plugin);

void print_usage(void) {
    printf("Usage: ./analyzer <queue_size> <plugin1> <plugin2> ... <pluginN>\n");
    printf("Arguments:\n");
    printf("  queue_size Maximum number of items in each plugin's queue\n");
    printf("  plugin1..N Names of plugins to load (without .so extension)\n");
    printf("Available plugins:\n");
    printf("  logger - Logs all strings that pass through\n");
    printf("  typewriter - Simulates typewriter effect with delays\n");
    printf("  uppercaser - Converts strings to uppercase\n");
    printf("  rotator - Move every character to the right. Last character moves to the beginning.\n");
    printf("  flipper - Reverses the order of characters\n");
    printf("  expander - Expands each character with spaces\n");
    printf("Example:\n");
    printf("  ./analyzer 20 uppercaser rotator logger\n");
    printf("  echo 'hello' | ./analyzer 20 uppercaser rotator logger\n");
    printf("  echo '<END>' | ./analyzer 20 uppercaser rotator logger\n");
}

void cleanup_plugins(plugin_handle_t* plugins, int count) {
    if (plugins == NULL) return;
    
    for (int i = 0; i < count; i++) {
        if (plugins[i].fini != NULL) {
            plugins[i].fini();
        }
        if (plugins[i].name != NULL) {
            free(plugins[i].name);
        }
        if (plugins[i].handle != NULL) {
            dlclose(plugins[i].handle);
        }
    }
    free(plugins);
}

int parse_queue_size(const char* arg) {
    char* endptr;
    long queue_size = strtol(arg, &endptr, 10);
    
    // Check if conversion was successful and the number is positive
    if (*endptr != '\0' || queue_size <= 0 || queue_size > INT_MAX) {
        return -1;
    }
    
    return (int)queue_size;
}

int load_plugin(const char* plugin_name, plugin_handle_t* plugin) {
    // Construct filename
    size_t filename_len = strlen(plugin_name) + 11; // "output/" + ".so\0" = 7 + 4 = 11
    char* filename = malloc(filename_len);
    if (filename == NULL) {
        fprintf(stderr, "Memory allocation failed for plugin filename\n");
        return -1;
    }
    snprintf(filename, filename_len, "output/%s.so", plugin_name);
    
    // Load shared object
    plugin->handle = dlopen(filename, RTLD_NOW | RTLD_LOCAL);
    if (plugin->handle == NULL) {
        fprintf(stderr, "Failed to load plugin '%s': %s\n", filename, dlerror());
        free(filename);
        return -1;
    }
    free(filename);
    
    // Clear any existing error
    dlerror();
    
    // Load function symbols
    plugin->init = (plugin_init_func_t)dlsym(plugin->handle, "plugin_init");
    if (plugin->init == NULL) {
        fprintf(stderr, "Failed to find plugin_init in '%s': %s\n", plugin_name, dlerror());
        dlclose(plugin->handle);
        return -1;
    }
    
    plugin->fini = (plugin_fini_func_t)dlsym(plugin->handle, "plugin_fini");
    if (plugin->fini == NULL) {
        fprintf(stderr, "Failed to find plugin_fini in '%s': %s\n", plugin_name, dlerror());
        dlclose(plugin->handle);
        return -1;
    }
    
    plugin->place_work = (plugin_place_work_func_t)dlsym(plugin->handle, "plugin_place_work");
    if (plugin->place_work == NULL) {
        fprintf(stderr, "Failed to find plugin_place_work in '%s': %s\n", plugin_name, dlerror());
        dlclose(plugin->handle);
        return -1;
    }
    
    plugin->attach = (plugin_attach_func_t)dlsym(plugin->handle, "plugin_attach");
    if (plugin->attach == NULL) {
        fprintf(stderr, "Failed to find plugin_attach in '%s': %s\n", plugin_name, dlerror());
        dlclose(plugin->handle);
        return -1;
    }
    
    plugin->wait_finished = (plugin_wait_finished_func_t)dlsym(plugin->handle, "plugin_wait_finished");
    if (plugin->wait_finished == NULL) {
        fprintf(stderr, "Failed to find plugin_wait_finished in '%s': %s\n", plugin_name, dlerror());
        dlclose(plugin->handle);
        return -1;
    }
    
    plugin->get_name = (plugin_get_name_func_t)dlsym(plugin->handle, "plugin_get_name");
    if (plugin->get_name == NULL) {
        fprintf(stderr, "Failed to find plugin_get_name in '%s': %s\n", plugin_name, dlerror());
        dlclose(plugin->handle);
        return -1;
    }
    
    // Store plugin name
    plugin->name = malloc(strlen(plugin_name) + 1);
    if (plugin->name == NULL) {
        fprintf(stderr, "Memory allocation failed for plugin name\n");
        dlclose(plugin->handle);
        return -1;
    }
    strcpy(plugin->name, plugin_name);
    
    return 0;
}

int main(int argc, char* argv[]) {
    // Step 1: Parse command-line arguments
    if (argc < 3) {
        fprintf(stderr, "Error: Insufficient arguments\n");
        print_usage();
        return 1;
    }
    
    // Parse queue size
    int queue_size = parse_queue_size(argv[1]);
    if (queue_size == -1) {
        fprintf(stderr, "Error: Invalid queue size '%s'\n", argv[1]);
        print_usage();
        return 1;
    }
    
    int plugin_count = argc - 2;
    plugin_handle_t* plugins = NULL;
    
    // Step 2: Load plugin shared objects
    plugins = malloc(plugin_count * sizeof(plugin_handle_t));
    if (plugins == NULL) {
        fprintf(stderr, "Memory allocation failed for plugins array\n");
        return 1;
    }
    
    // Initialize plugin handles
    for (int i = 0; i < plugin_count; i++) {
        memset(&plugins[i], 0, sizeof(plugin_handle_t));
    }
    
    // Load each plugin
    for (int i = 0; i < plugin_count; i++) {
        if (load_plugin(argv[i + 2], &plugins[i]) != 0) {
            cleanup_plugins(plugins, i);
            print_usage();
            return 1;
        }
    }
    
    // Step 3: Initialize plugins
    for (int i = 0; i < plugin_count; i++) {
        const char* error = plugins[i].init(queue_size);
        if (error != NULL) {
            fprintf(stderr, "Failed to initialize plugin '%s': %s\n", plugins[i].name, error);
            cleanup_plugins(plugins, plugin_count);
            return 2;
        }
    }
    
    // Step 4: Attach plugins together
    for (int i = 0; i < plugin_count - 1; i++) {
        plugins[i].attach(plugins[i + 1].place_work);
    }
    // Last plugin is not attached to anything
    
    // Step 5: Read input from STDIN
    char input_line[1025]; // 1024 characters + null terminator
    while (fgets(input_line, sizeof(input_line), stdin) != NULL) {
        // Remove trailing newline if present
        size_t len = strlen(input_line);
        if (len > 0 && input_line[len - 1] == '\n') {
            input_line[len - 1] = '\0';
        }
        
        // Send to first plugin
        const char* error = plugins[0].place_work(input_line);
        if (error != NULL) {
            fprintf(stderr, "Failed to place work in first plugin: %s\n", error);
            break;
        }
        
        // Check if this is the end signal
        if (strcmp(input_line, "<END>") == 0) {
            break;
        }
    }
    
    // Step 6: Wait for plugins to finish
    for (int i = 0; i < plugin_count; i++) {
        const char* error = plugins[i].wait_finished();
        if (error != NULL) {
            fprintf(stderr, "Error waiting for plugin '%s' to finish: %s\n", plugins[i].name, error);
        }
    }
    
    // Step 7: Cleanup
    cleanup_plugins(plugins, plugin_count);
    
    // Step 8: Finalize
    printf("Pipeline shutdown complete\n");
    return 0;
}