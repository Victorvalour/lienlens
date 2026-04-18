# LienLens

**LienLens** is a TypeScript MCP (Model Context Protocol) server that provides real estate tax delinquency intelligence. It aggregates tax delinquency records across counties and exposes them as MCP tools for AI agents.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     LienLens MCP Server                      │
│                                                             │
│  ┌──────────────┐   ┌──────────────────────────────────┐    │
│  │  Express +   │   │           MCP Tools               │    │
│  │  Context     │──▶│  Intelligence   │   Data          │    │
│  │  Protocol    │   │  ─────────────  │   ────────────  │    │
│  │  Middleware  │   │  analyze_       │   get_distress_ │    │
│  └──────────────┘   │  property_      │   signals       │    │
│                     │  distress       │                 │    │
│  ┌──────────────┐   │                 │   get_tax_      │    │
│  │   Redis      │   │  compare_       │   delinquencies │    │
│  │   Cache      │   │  county_        │                 │    │
│  └──────────────┘   │  distress       │   list_         │    │
│                     │                 │   supported_    │    │
│  ┌──────────────┐   │  find_distress_ │   counties      │    │
│  │  PostgreSQL  │   │  opportunities  │                 │    │
│  │  Database    │   └─────────────────┴─────────────────┘    │
│  └──────────────┘                                            │
│  ┌──────────────────────────────────────────────────┐   │    │
│  │  Adapters: Cook IL │ Philadelphia PA │ NYC NY │ Franklin OH │
│  └──────────────────────────────────────────────────┘   │    │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### With Docker Compose

```bash
git clone <repo>
cd lienlens
cp .env.example .env
docker-compose up --build
```

The server will be available at `http://localhost:3000`.

### Local Development

```bash
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and REDIS_URL
npm run dev
```

### Build

```bash
npm run build
npm start
```

## MCP Tools

| Tool | Type | Description | Price |
|------|------|-------------|-------|
| `analyze_property_distress` | Intelligence | Rank tax-delinquent properties using composite distress score | $0.10 |
| `compare_county_distress` | Intelligence | Compare tax delinquency activity across multiple counties | $0.10 |
| `find_distress_opportunities` | Intelligence | Find high-exposure tax delinquency investment opportunities | $0.10 |
| `get_distress_signals` | Data | Paginated tax delinquency signals with filtering | $0.001 |
| `get_tax_delinquencies` | Data | Tax delinquency records with filtering | $0.001 |
| `list_supported_counties` | Data | List supported counties and metadata | $0.001 |

## Supported Counties

| FIPS | County | State | Data Types |
|------|--------|-------|------------|
| 17031 | Cook County | IL | Tax delinquency |
| 42101 | Philadelphia County | PA | Tax delinquency |
| 36061 | New York City | NY | Tax delinquency |
| 39049 | Franklin County | OH | Tax delinquency |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `REDIS_URL` | Redis connection string | — |
| `PORT` | HTTP server port | `3000` |
| `NODE_ENV` | Environment | `development` |

> **Note:** Both `DATABASE_URL` and `REDIS_URL` are optional. The server gracefully degrades — if the DB is unavailable, tools return realistic demo data. If Redis is unavailable, caching is skipped.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/mcp` | MCP session init & requests |
| `GET` | `/mcp` | SSE streaming |
| `DELETE` | `/mcp` | Session cleanup |
| `GET` | `/health` | Health check |

## Distress Score

The distress score (0–100) is calculated from:
- **Amount owed** (up to 40 pts): logarithmic scale based on outstanding tax amount
- **Years delinquent** (up to 30 pts): more years = higher risk
- **Signal count** (up to 15 pts): multiple liens on a property signal deeper distress
- **Recency** (up to 10 pts): recent filings score higher
- **Tax-sale status** (up to 5 pts): properties scheduled for tax sale score higher

**Actionability ratings:** `hot` (≥70), `warm` (≥40), `cold` (<40)

## Development

```bash
# Install dependencies
npm install

# Run in dev mode (no build required)
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start
```

## Database Setup

Apply the schema with:

```bash
psql $DATABASE_URL < src/db/schema.sql
```

Or use `docker-compose` which auto-runs `schema.sql` on first start.
