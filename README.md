# Custom matchmaking server for [A Few Quick Matches](https://store.steampowered.com/app/3805420/A_Few_Quick_Matches/)

This is the simpler version of the custom matchmaking server for the game [A Few Quick Matches](https://store.steampowered.com/app/3805420/A_Few_Quick_Matches/).

## Setup

You'll need to have the following installed:

- [Bun](https://bun.sh): <https://bun.sh>

Make sure to copy `.env.example` and rename it to `.env`.

To create database tables:

```bash
bun schema/migrate
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun start
```
