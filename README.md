# Spoon Project

## Setup

```bash
cp .env.template .env
```

```bash
bun install
```

## Development

```bash
bun run dev
```

## Database Setup

### Generate drizzle client

```bash
bunx drizzle-kit generate
```

### Apply Migrations

```bash
# Local database
bunx wrangler d1 migrations apply spoon_project --local

# Remote database
bunx wrangler d1 migrations apply spoon_project --remote
```
