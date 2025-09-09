````markdown
# Modular Pipeline System

This repository contains my implementation of the **Modular Multithreaded String Analyzer Pipeline** in C, developed as the final project for the Operating Systems course at Reichman University.  

The system demonstrates **systems programming, multithreading, synchronization, and dynamic linking** by building a plugin-based pipeline that processes strings from standard input.  
Each plugin is dynamically loaded as a shared object (`.so`) and runs in its own thread, communicating via bounded producer–consumer queues.

---

## 📚 Project Structure

- `main.c` – Main application: loads plugins, manages the pipeline, orchestrates execution.  
- `plugin_common.c/.h` – Shared plugin infrastructure (queue handling, threading, lifecycle).  
- `plugin_sdk.h` – Defines the required interface for all plugins.  
- `consumer_producer.c/.h` – Thread-safe bounded queue implementation.  
- `monitor.c/.h` – Synchronization primitive (mutex + condition variable wrapper).  
- `plugins/` – Individual plugin implementations (e.g., `uppercaser.c`, `logger.c`).  
- `output/` – Compiled plugins (`.so` files) are placed here.  
- `build.sh` – Build script (compiles main and all plugins).  
- `test.sh` – Automated test script.  

---

## ▶️ Usage

The analyzer is executed with a queue size and a sequence of plugin names:

```bash
./analyzer <queue_size> <plugin1> <plugin2> ... <pluginN>
````

* **queue\_size** → Maximum number of items per plugin queue.
* **plugin1..N** → Names of plugins to load (without `.so`).

### Example

```bash
echo "hello" | ./analyzer 20 uppercaser rotator logger flipper typewriter
```

Pipeline order:

1. `uppercaser` – convert to uppercase
2. `rotator` – rotate characters right
3. `logger` – print to stdout
4. `flipper` – reverse string
5. `typewriter` – print with typing effect

Input:

```
hello
<END>
```

Output (approximate):

```
[logger] OHELL
[typewriter] LLEHO
```

---

## 🛠 Available Plugins

* **logger** – Logs all strings to stdout.
* **typewriter** – Prints each character with 100ms delay.
* **uppercaser** – Converts text to uppercase.
* **rotator** – Rotates characters (last → first).
* **flipper** – Reverses strings.
* **expander** – Inserts spaces between characters.

---

## 🧩 Plugin SDK

All plugins must implement the standard interface defined in `plugin_sdk.h`:

```c
const char* plugin_get_name(void);
const char* plugin_init(int queue_size);
const char* plugin_fini(void);
const char* plugin_place_work(const char* str);
void plugin_attach(const char* (*next_place_work)(const char*));
const char* plugin_wait_finished(void);
```

The **common infrastructure** (`plugin_common.c/.h`) handles queues, threads, and forwarding, so plugin authors only need to implement their string transformation logic.

---

## ✅ Features

* Dynamic plugin loading with `dlopen` and `dlsym`.
* Each plugin runs in its own thread.
* Thread-safe producer–consumer queues (no busy waiting).
* Graceful shutdown when `<END>` is received.
* Shared infrastructure to reduce boilerplate in plugins.
* Automated build (`build.sh`) and test (`test.sh`) scripts.

---

## 📖 Notes

* Written in C, compiled with **gcc 13** on **Ubuntu 24.04**.
* Only standard libraries plus **pthread** and **dl** are used.
* Input lines are limited to 1024 characters.
* Same plugin may appear multiple times in the pipeline.

```
