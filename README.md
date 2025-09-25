# Crypto Dashboard (Full Assignment Implementation)

This project implements the full assignment requirements from your PDF: a production-like crypto dashboard that fetches live market data from the CoinGecko API.

## Features implemented (complete checklist)
- All Coins view with:
  - Rank, Name & symbol, Icon, Current price, 24h change, Market cap, 24h volume
  - Infinite scroll (page-size: 50)
  - Search by name/symbol with debouncing (client-side filter)
  - Sorting controls (market cap, volume, price, 24h change)
  - Click row → detail modal (fetches `/coins/{id}`)
- Highlights section with:
  - Top gainers (24h)
  - Top losers (24h)
  - Trending coins (CoinGecko `/search/trending`)
- Resilience & UX:
  - Loading skeletons for table rows
  - Error messaging + Retry button
  - Empty state handling
  - Basic in-memory caching to reduce repeated requests during a session
- Env-driven config (`.env.example`)
- README includes architecture, assumptions, future improvements

## Run locally
1. `npm install`
2. copy `.env.example` to `.env` and adjust if needed
3. `npm run dev`

## Tech & patterns
- React + Vite + TailwindCSS
- Axios for HTTP requests
- Service layer (`src/services/coingecko.js`) acts as adapter to the CoinGecko API
- Client-side caching (Map) and debounced search to reduce API usage
- Infinite scroll via IntersectionObserver
- Modular components (`components/AllCoins`, `components/Highlights`, `components/Header`)

## Limitations & future improvements
- Only client-side filtering for search (CoinGecko search endpoint could be used for more accurate results)
- No server-side pagination or proxy; in production, add a server/proxy to manage rate limits & API keys securely
- Add unit/integration tests, accessibility audits, more robust retry/backoff strategies, and monitoring

## API endpoints used
- `/coins/markets` for market data
- `/search/trending` for trending
- `/coins/{id}` for details

## Notes
- Do not commit real API keys. Use `.env` for configuration.
- This project aims to cover all assignment requirements; feel free to extend or replace parts for your own architecture choices.

