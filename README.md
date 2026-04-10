# LienLens

**LienLens** is a TypeScript MCP (Model Context Protocol) server that provides real estate distress signal intelligence. It aggregates tax delinquencies, pre-foreclosure filings, and other distress indicators across counties and exposes them as MCP tools for AI agents.

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
│  └──────────────┘   │  distress       │   get_          │    │
│                     │                 │   preforeclos-  │    │
│  ┌──────────────┐   │  find_distress_ │   ures          │    │
│  │  PostgreSQL  │   │  opportunities  │                 │    │
│  │  Database    │   │                 │   list_         │    │
│  └──────────────┘   └─────────────────┘   supported_   │    │
│                                           counties      │    │
│  ┌──────────────────────────────────────────────────┐   │    │
│  │  Scrapers: Harris TX │ Cook IL │ Maricopa AZ     │   │    │
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
| `analyze_property_distress` | Intelligence | Rank distressed properties using composite score | $0.10 |
| `compare_county_distress` | Intelligence | Compare distress levels across multiple counties | $0.10 |
| `find_distress_opportunities` | Intelligence | Find pre-foreclosure investment opportunities | $0.10 |
| `get_distress_signals` | Data | Paginated distress signals with filtering | $0.001 |
| `get_tax_delinquencies` | Data | Tax delinquency records with filtering | $0.001 |
| `get_preforeclosures` | Data | Lis pendens, NOD, NOTS filings | $0.001 |
| `list_supported_counties` | Data | List supported counties and metadata | $0.001 |

## Supported Counties

| FIPS | County | State | Data Types |
|------|--------|-------|------------|
| 48201 | Harris County | TX | Tax liens, Pre-foreclosures |
| 17031 | Cook County | IL | Tax liens, Pre-foreclosures |
| 04013 | Maricopa County | AZ | Tax liens, Pre-foreclosures |

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
- **Signal severity** (up to 40 pts): NOTS > NOD > Lis Pendens > Tax Lien > Code Violation
- **Signal count** (up to 15 pts): more signals = higher risk
- **Amount owed** (up to 25 pts): logarithmic scale
- **Recency** (up to 10 pts): recent filings score higher
- **Duration** (up to 10 pts): years delinquent

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
