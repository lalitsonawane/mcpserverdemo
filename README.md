# Open-Meteo MCP Server

Sample Model Context Protocol server for a public open-source/no-key API.

This server wraps the [Open-Meteo API](https://open-meteo.com/) and exposes three MCP tools:

- `search_locations` - search locations by city or place name
- `get_current_weather` - get current weather by latitude and longitude
- `get_daily_forecast` - get a daily forecast by latitude and longitude

No API key is required.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

MCP servers commonly communicate over stdio, so this command will appear to keep running. That is expected.

## Inspect The Server

```bash
npm run inspect
```

This opens the MCP Inspector so you can call the tools manually.

Try:

```json
{
  "name": "Bengaluru",
  "count": 3
}
```

with `search_locations`, then use one of the returned latitude/longitude pairs with `get_current_weather` or `get_daily_forecast`.

## Example MCP Client Config

Use the absolute path to this folder:

```json
{
  "mcpServers": {
    "open-meteo": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "/Users/lalit/Developments/MCPServer"
    }
  }
}
```

## Build

```bash
npm run build
```

After building, you can run:

```bash
npm start
```

## How This Maps API Endpoints To MCP Tools

The Open-Meteo HTTP endpoints are wrapped as model-callable MCP tools:

| API endpoint | MCP tool |
| --- | --- |
| `GET /v1/search` | `search_locations` |
| `GET /v1/forecast` with current weather fields | `get_current_weather` |
| `GET /v1/forecast` with daily forecast fields | `get_daily_forecast` |

This is the same pattern you can use for any REST API: validate inputs with `zod`, call the API from a small client module, and return concise JSON to the MCP client.
