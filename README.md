# HitoriChan

A Discord bot (Bocchi-themed) used for moderation, economy, and fun interactions. This README covers setup, running the bot, how commands are structured, and how to re-register slash commands so Discord sees choices/options.

**Quick start**: copy `.env.example` to `.env`, install deps, then run the bot.

## Table of Contents
- Project Overview
- Prerequisites
- Installation
- Configuration
- Running the bot
- Re-registering application commands
- Commands structure and metadata
- Help command behavior
- Development notes
- Troubleshooting

## Project Overview

This repository implements a Discord bot using discord.js and a simple file-based command structure (CommonJS). Commands live in `commands/` and are grouped by category (folders like `economy`, `moderation`, `fun`, `misc`). The bot dynamically loads command modules at runtime and registers them as application commands when the client becomes ready.

## Prerequisites

- Node.js 18+ (or the version compatible with your `discord.js` version)
- npm or yarn
- A MongoDB connection (if you intend to use persistence for economy/levels) or adjust models accordingly
- A Discord bot token and (optionally) a Guild ID for development-based command registration

## Installation

1. Clone the repo and cd into it:

```bash
git clone <repo-url>
cd HitoriChan
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables (create `.env`):

```bash
cp .env.example .env
# Edit .env with your token, MongoDB URI, and any config values
```

## Configuration

Key configuration is read from `config.json` and a few files under `config/` (e.g., `shop.json`, `warnings.json`). Make sure the bot token, MongoDB URI (if used), and other runtime values are present in your environment or `config.json` as your project expects.

## Running the bot

Start the bot in development:

```bash
node index.js
```

If using `npm` scripts, use whatever script you have (e.g., `npm run start`). For production, use a process manager like `pm2`:

```bash
pm2 start index.js --name HitoriChan
pm2 logs HitoriChan
```

## Re-registering application commands (important)

The bot registers application commands when it emits the `ready` event (see `events/clientReady/handler.js`). If you change command metadata (options, choices, or add `category`/`examples` fields), you must restart the bot so the registration handler runs and updates commands with Discord.

- For guild-scoped commands (development), updates apply almost immediately after the handler runs.
- For global commands, Discord can take up to an hour to propagate changes.

If you need to force re-registration without waiting for a full restart, you can implement a small script that calls the same registration logic (or trigger the ready handler), but restarting the process is simplest.

## Commands structure and metadata

- Commands live under `commands/<category>/<command>.js`.
- Each command module exports an object with fields like:
	- `name`: command name (string)
	- `description`: short description
	- `category`: a string matching the folder (e.g. `economy`, `moderation`) used by the dynamic help UI
	- `options`: Discord application command options (if any)
	- `permissionsRequired` / `botPermissions`: permissions arrays
	- `examples`: an array of example invocations used by the help command
	- `callback`: the function that runs when the command is invoked

Adding or updating `options` with `choices` requires the registration handler to format them correctly before creating/editing application commands. The project includes logic to normalize nested options/choices when registering.

## Help command behavior

The `/help` command (`commands/help.js`) is dynamic:

- It loads all local commands at runtime using `utils/getLocalCommands`.
- Commands must export `name`, `description`, and preferably `category` and `examples` for the help UI to show accurate data.
- The help UI uses dropdowns (String Select) to pick categories and then individual commands, showing usage and examples.

If a command is missing `category` or `examples`, the help command has heuristics but may group or display the command less accurately. Add `category` to each module for reliable grouping.

## Development notes

- When editing command metadata (`options`, `choices`, `category`, `examples`), restart the bot to update Discord's application command registry.
- Keep command exports minimal and consistent: `name`, `description`, `options`, `callback`.
- Avoid breaking the command loader's expectations (it's a simple require/inspect flow).

## Troubleshooting

- Choices not appearing in Discord's slash-command UI:
	- Ensure the registration handler (client-ready) is running after the command files contain `choices` in their `options` and that the handler formats them. Restart the bot to re-register.
- Command not listed in help or grouped correctly:
	- Add `category: '<category>'` to the command module's export and restart.
- Permission errors when executing a command:
	- Confirm the `permissionsRequired` and `botPermissions` fields are correct and that the bot has the permissions in the guild.

## Contributing

Pull requests welcome. Small, focused changes are best (fixes, metadata additions, tests). If you add new categories, update the `help.js` category list or make the help menu automatically discover categories from folder names.

## License

This project does not include a license file. Add one if you plan to open-source the repository.



