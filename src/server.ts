import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  getCurrentWeather,
  getDailyForecast,
  searchLocations
} from "./openMeteo.js";

const server = new McpServer({
  name: "open-meteo-mcp-server",
  version: "1.0.0"
});

server.registerTool(
  "search_locations",
  {
    title: "Search Locations",
    description:
      "Search for locations by name using the Open-Meteo geocoding API. No API key is required.",
    inputSchema: {
      name: z.string().min(1).describe("City or place name, such as Bengaluru"),
      count: z
        .number()
        .int()
        .min(1)
        .max(10)
        .default(5)
        .describe("Maximum number of matching locations to return")
    }
  },
  async ({ name, count }) => {
    const locations = await searchLocations(name, count);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ locations }, null, 2)
        }
      ]
    };
  }
);

server.registerTool(
  "get_current_weather",
  {
    title: "Get Current Weather",
    description:
      "Get current weather for latitude and longitude using the Open-Meteo forecast API. No API key is required.",
    inputSchema: {
      latitude: z.number().min(-90).max(90).describe("Latitude in decimal degrees"),
      longitude: z
        .number()
        .min(-180)
        .max(180)
        .describe("Longitude in decimal degrees")
    }
  },
  async ({ latitude, longitude }) => {
    const weather = await getCurrentWeather(latitude, longitude);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(weather, null, 2)
        }
      ]
    };
  }
);

server.registerTool(
  "get_daily_forecast",
  {
    title: "Get Daily Forecast",
    description:
      "Get a daily weather forecast for latitude and longitude using the Open-Meteo forecast API. No API key is required.",
    inputSchema: {
      latitude: z.number().min(-90).max(90).describe("Latitude in decimal degrees"),
      longitude: z
        .number()
        .min(-180)
        .max(180)
        .describe("Longitude in decimal degrees"),
      days: z
        .number()
        .int()
        .min(1)
        .max(16)
        .default(7)
        .describe("Number of forecast days to return")
    }
  },
  async ({ latitude, longitude, days }) => {
    const forecast = await getDailyForecast(latitude, longitude, days);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(forecast, null, 2)
        }
      ]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
