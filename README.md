# CDD Framework (Node Adapter)

> **Cyberattack-Driven Development**: A high-performance vulnerability scanner powered by Rust.

[![Rust](https://img.shields.io/badge/Language-Rust-orange.svg)](https://www.rust-lang.org/)
[![Node.js](https://img.shields.io/badge/Language-Node.js-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Followers](https://img.shields.io/github/followers/jemmyx?style=social)](https://github.com/jemmyx)

CDD is a modern security scanning engine designed for speed and reliability. It combines a **memory-safe Rust core** for intensive network operations with a **Node.js CLI** for a seamless developer experience.

---

## Quick Start

You don't need to have Rust installed locally to use the framework. The installer automatically fetches the pre-compiled binary for your specific architecture (Windows, macOS, or Linux).

This package is the entry point for the **Cyberattack-Driven Development** workflow. 
It acts as a wrapper around the native `ratel-cli` engine.

## Prerequisites
1. **Ratel-CLI**: Must be installed globally via the official `install.sh`. 
   `ratel-cli` includes the native `cdd-core` library.

## Usage

### 1. Initialize a project
Setup the `.ratel` scenario and integrity baseline:
```bash
npx cdd-framework init
```

2. Run Security Audit
This command calls the global ratel binary, parses the DSL, executes attacks via cdd-core, and displays a formatted report:

```Bash

npx cdd-framework run tests/ratel/security.ratel
```

3. Pass-through commands
Any other command is sent directly to the native engine:

```Bash

npx cdd-framework check
npx cdd-framework --version

```

## Architecture
The framework is architected for maximum performance and modularity:

cdd-core (Rust): Handles raw HTTP requests and concurrent scanning using tokio and reqwest. It features a strictly typed error system (CddError) to ensure the engine never crashes silently.

cdd-node (Node.js): Orchestrates binary execution and formats raw JSON output into a professional "Hacker Dark Mode" terminal table.

## Error Handling
CDD implements a robust diagnostic system. If a scan fails, the engine provides clear, structured feedback:

InvalidUrl: The provided target URL is malformed or unreachable.

NetworkError: Connection failure, DNS issues, or request timeout.

InternalError: Captured internal engine configuration issues.

## Contributing
This is an open-source project. Feel free to open issues or submit pull requests to add new security tests to the Rust core!

Author: Fabio Meyer<github.com/jemmyx>

Version: 0.4.0-alpha.5

License: MIT