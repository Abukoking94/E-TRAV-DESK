# E-Trav Desk

E-Trav Desk is a frontend-only travel intelligence platform starter built with `Vite`, `React`, `Tailwind CSS`, `Zustand`, and `TanStack Query`.

The project starts as a premium landing-page experience and expands into a destination intelligence product with live search, regional discovery, comparison, saved destinations, and detail views powered by public APIs.

## Stack

- `React` + `Vite`
- `Tailwind CSS`
- `react-router-dom`
- `@tanstack/react-query`
- `zustand`
- `zod`
- `recharts`
- `lucide-react`

## Core APIs

- [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api)
- [Open-Meteo Forecast](https://open-meteo.com/en/docs)
- [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api)
- [Open-Meteo Marine](https://open-meteo.com/en/docs/marine-weather-api)
- [REST Countries](https://restcountries.com/)
- [Wikimedia API Portal](https://api.wikimedia.org/wiki/Main_Page)
- [World Bank Indicators API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation)

## Setup

```bash
npm install
npm run dev
```

## App surfaces

- `/` cinematic landing page and discovery entry
- `/explore` live country and city discovery
- `/destination/:countryCode` destination intelligence view
- `/compare` multi-destination comparison board
- `/regions/:region` region hub
- `/saved` persisted saved destinations
- `/journal` editorial-style destination surface
- `/about` product story

## Architecture

```text
src/
  app/        providers, routing, shell layout
  pages/      route-level screens
  features/   domain-level UI sections
  components/ reusable UI, cards, and charts
  services/   API clients, schemas, query keys, mappers
  store/      Zustand store and slices
  hooks/      shared hooks
  lib/        formatters, constants, class utilities
  styles/     Tailwind entry and global theme styling
```

## Current starter scope

- App shell and routing
- Tailwind theme and futuristic base styling
- Real country, weather, air-quality, marine, and summary API clients
- World Bank development and tourism-readiness indicators
- Destination explorer
- Destination detail page
- Compare and save flows with Zustand persistence
- Region and journal starter routes

## Full roadmap

### Phase 1: Foundation

1. Lock the visual system:
   - spacing scale
   - typography rules
   - card variants
   - dashboard surfaces
2. Strengthen the route shell:
   - responsive header behavior
   - command palette search
   - improved mobile drawer
3. Expand reusable primitives:
   - tabs
   - drawers
   - modal patterns
   - metric cards

### Phase 2: Discovery

1. Turn `/explore` into a real search engine:
   - climate filters
   - coastal filters
   - population ranges
   - language filters
2. Add sorting:
   - hottest now
   - coolest now
   - highest population
   - cleanest air
3. Add search result grouping:
   - countries
   - capitals
   - cities

### Phase 3: Destination intelligence

1. Enrich `/destination/:countryCode`:
   - timezone cards
   - local time
   - neighboring countries
   - currency and language panels
2. Add richer weather interpretation:
   - comfort score
   - air-quality severity
   - marine suitability
3. Add seasonal storytelling:
   - best time to visit
   - climate narrative
   - travel mood tags

### Phase 4: Region hubs

1. Build region-specific landers:
   - Africa
   - Europe
   - Asia
   - Americas
   - Oceania
2. Add region intelligence:
   - top countries by population
   - warmest destinations this week
   - cleanest-air destinations
   - editorial collections

### Phase 5: Compare and save

1. Expand compare into a real product surface:
   - shared metrics grid
   - climate scoring
   - radar or bar comparisons
2. Improve saved journeys:
   - collections
   - pinned routes
   - recently viewed trails

### Phase 6: Editorial and premium polish

1. Make `/journal` a strong storytelling layer:
   - region stories
   - trend stories
   - editorial collections
2. Add premium motion:
   - route transitions
   - staggered reveals
   - sticky panels
   - animated section entries
3. Refine performance:
   - query tuning
   - image fallbacks
   - skeleton coverage
   - error boundaries

### Phase 7: Advanced data expansion

1. Add a second intelligence layer:
   - World Bank indicators
   - tourism readiness proxy metrics
   - economic context
2. Add mapping:
   - route map
   - region map
   - destination clustering

### Implemented advanced layers

- World Bank-powered destination context and readiness scoring
- SVG geospatial mapping for region hubs, destination routes, and compare clustering

## Notes

- `src/main.jsx` and `src/App.jsx` are intentionally kept as the main entry files.
- The project is frontend-only and does not rely on mock data.
- API response validation is handled with `zod`.
- State persistence is handled with Zustand middleware.
