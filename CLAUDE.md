# silner-showcase-prime

Portfolio showcase built with React, TypeScript, Vite, shadcn-ui, and Tailwind CSS.

## Development

```sh
npm install
npm run dev       # start dev server
npm run build     # production build
npm run test      # run tests
npm run lint      # lint
```

## Project structure

- `src/pages/` – route-level page components
- `src/components/` – reusable UI components (shadcn-ui based)
- `src/hooks/` – custom React hooks
- `src/data/` – static data / content
- `src/lib/` – utility helpers

## CandleKeep

CandleKeep is installed (`ck` CLI, v0.7.5). It provides AI agents access to a document library for in-context reading.

Install (if not present):

```sh
curl -fsSL https://getcandlekeep.com/install.sh | sh
```

Common commands:

```sh
ck auth login          # authenticate
ck items list          # list your document library
ck items read <id>:1-10  # read pages 1-10 of a document
ck items add ./file.pdf  # upload a PDF
```

Config is stored at `~/.candlekeep/config.toml`.
