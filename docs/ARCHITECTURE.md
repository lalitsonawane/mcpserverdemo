# Architecture

The server is a TypeScript MCP server that runs on Node.js, communicates with MCP clients over stdio, validates tool inputs with `zod`, and calls Open-Meteo public HTTP APIs through a small client module.

## Runtime Overview

```mermaid
flowchart LR
    user["User"] --> client["MCP client"]
    client -->|JSON-RPC over stdio| transport["StdioServerTransport"]
    transport --> server["McpServer"]
    server --> registry["Registered tools"]
    registry --> meteo["src/openMeteo.ts"]
    meteo --> geocoding["Open-Meteo Geocoding API"]
    meteo --> forecast["Open-Meteo Forecast API"]
```

## Module Responsibilities

| File | Responsibility |
| --- | --- |
| [../src/server.ts](../src/server.ts) | Creates the MCP server, registers tools, defines `zod` input schemas, calls API helpers, and returns MCP content. |
| [../src/openMeteo.ts](../src/openMeteo.ts) | Owns Open-Meteo endpoint URLs, response types, URL query construction, fetch execution, and HTTP error handling. |
| [../package.json](../package.json) | Defines scripts for development, build, production start, and MCP Inspector. |
| [../tsconfig.json](../tsconfig.json) | Configures strict TypeScript compilation for NodeNext modules. |

## Tool Call Sequence

```mermaid
sequenceDiagram
    participant Person as User
    participant Client as MCP client
    participant Server as src/server.ts
    participant Meteo as src/openMeteo.ts
    participant API as Open-Meteo API

    Person->>Client: Ask for weather data
    Client->>Server: Call MCP tool with arguments
    Server->>Server: Validate arguments with zod
    Server->>Meteo: Call typed API helper
    Meteo->>API: Send HTTP request
    API-->>Meteo: Return JSON response
    Meteo-->>Server: Return typed data
    Server-->>Client: Return JSON text content
    Client-->>Person: Present result
```

## Data Flow

```mermaid
flowchart TD
    args["Tool arguments"] --> validation["zod validation"]
    validation --> handler["MCP tool handler"]
    handler --> helper["Open-Meteo helper"]
    helper --> url["URL with query parameters"]
    url --> request["fetch request"]
    request --> ok{"HTTP ok"}
    ok -->|yes| json["Typed JSON data"]
    ok -->|no| error["Error with status and body"]
    json --> response["MCP text content"]
```

## External Services

| Service | Base URL | Used by |
| --- | --- | --- |
| Open-Meteo Geocoding | `https://geocoding-api.open-meteo.com/v1` | `search_locations` |
| Open-Meteo Forecast | `https://api.open-meteo.com/v1` | `get_current_weather`, `get_daily_forecast` |

No API key is required for the current integration.

## Design Notes

- The server uses stdio, so stdout belongs to MCP protocol traffic.
- Tool inputs are checked before any upstream HTTP request is made.
- Open-Meteo HTTP errors are surfaced as thrown errors containing status, status text, and response body.
- Response data is returned as formatted JSON text so a model or inspector can read it directly.

