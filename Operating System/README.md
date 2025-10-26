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
