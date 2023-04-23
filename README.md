# WebUI

A tiny library to make writing web applications faster without the need for huge complex libraries.

## Core concepts

1. Each component of a site is a `Module`. Modules can be put inside of modules again. This allows to create nested structures very easily.
2. A webapp typically is a collection of pages between which the user jumps. A `PageManager` allows to register modules as pages, to switch between them. The manager hides the old module, shows the new module and then updates it with the arguments provided to open. This is done using hashes, so that the URLs are exportable and the back and forward of the browser works.
3. Other common components can be implemented, so they can be reused in different apps.

## Setup

In your project simply add this repository as a submodule in your source folder. This makes the setup trivial, and independent of your build system and project structure. Also fixing bugs and PRs is easier.

```bash
git submodule add CLONE_URL src/webui
```

## Update

```bash
cd src/webui
git pull
```

## Submit bugfixes

Fix the bug in the code, then commit and push (on a fork if you are not core maintainer). Easy.

