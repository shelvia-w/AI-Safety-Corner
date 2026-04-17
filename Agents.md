# AGENTS.md

## Project overview

This repo is a static AI safety website with multiple content sections:

* glossary
* research highlights
* system cards
* evaluations
* failure cases
* core readings

## Development priorities

* Preserve current frontend behavior unless a task explicitly asks for UI changes
* Prefer minimal, targeted edits over broad refactors
* Keep code readable and well-structured
* Do not silently remove content fields
* Keep slugs and URLs stable
* Avoid breaking filters, search, pagination, or section rendering

## Content architecture preference

When restructuring content:

* prefer one source data file per entry
* prefer slug-based filenames
* prefer generated frontend-ready files over runtime fetching when possible
* generated files must include a clear auto-generated warning comment

## Implementation rules

* inspect existing code before editing
* propose a concise plan before major migrations
* preserve backward compatibility where practical
* validate entry counts and required fields after migration
* surface malformed content rather than guessing

## Documentation

Whenever changing data architecture:

* update contributor instructions
* explain how to add new entries
* explain how to rebuild generated data
