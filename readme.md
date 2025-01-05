# Quizzies

A modern web-based quiz bowl reader with audio functionality, designed to run NAQT questions from the [QBReader database](https://www.qbreader.org/database/).

Also see:
- [QBVReader](https://hsquizbowl.org/forums/viewtopic.php?t=28652) - Discord-bot based, with solid multiplayer functionality
- [Power QB](https://www.powerqb.org/) - very similar to this project

## Features

- Audio-enabled question reading
- Accompanying text with power marking
- Difficulty & category filters

## Tech stack

- Web app: SvelteKit with shadcn-svelte components
- Database: SQLite with Drizzle ORM
- Docker deployment

## Self-hosting

Included `docker-compose` file requires the SQLite database as a mapped volume (currently ~2 GB for ~7k tossups). If you're interested, reach out to me via email (linked in profile) or Discord (username `avirut`) and I'll set up a share link for the database.

## Structure

- `/web` - Main application code
- `/backend` - Notebook for generation of database (incl. audio) from QBReader data
- `docker-compose.yml` - Container configuration