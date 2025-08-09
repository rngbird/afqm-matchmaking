# Custom matchmaking server for [A Few Quick Matchs](https://store.steampowered.com/app/3805420/A_Few_Quick_Matches/)

This is a custom matchmaking server for the game [A Few Quick Matchs](https://store.steampowered.com/app/3805420/A_Few_Quick_Matches/).

## Setup

You'll need to have the following installed:

- [Bun](https://bun.sh): <https://bun.sh>
- [PostgreSQL](https://www.postgresql.org): <https://www.postgresql.org>
- [Redis](https://redis.io): <https://redis.io>

Make sure to copy `.env.example` and rename it to `.env`.

Open `.env` and make sure to replace `PG_URL` `REDIS_URL` with the correct connection URL for each respective databases.

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
