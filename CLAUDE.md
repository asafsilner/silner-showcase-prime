# Silner Showcase Prime

Portfolio website for Asaf Silner — interactive experience designer, art director, and game designer.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Animation**: Framer Motion
- **Routing**: React Router v6
- **Testing**: Vitest + Testing Library
- **Package manager**: npm (use `npm run dev`, not bun or yarn)

## Key Commands

```bash
npm run dev       # Dev server
npm run build     # Production build
npm run test      # Run tests (Vitest)
npm run lint      # ESLint check
```

## Project Structure

```
src/
  data/projects.ts      # ALL project data — single source of truth (15 projects)
  pages/
    Index.tsx           # Home page (Hero + WorkGrid)
    ProjectPage.tsx     # Individual project detail page (/project/:id)
    NotFound.tsx        # 404
  components/
    Header.tsx          # Sticky nav
    Hero.tsx            # Landing hero section
    WorkGrid.tsx        # Filterable project grid
    ProjectCard.tsx     # Project thumbnail card
    NavLink.tsx         # Animated nav link
  hooks/
    use-mobile.tsx      # Mobile breakpoint hook
    use-toast.ts        # Toast notifications
  lib/utils.ts          # Tailwind class merge utility (cn)
```

## Data Model

`src/data/projects.ts` exports `projectsData: Project[]` and `getProjectById(id)`.

Each `Project` has:
- `id` — URL slug (e.g., `"hot-wheels"`)
- `media` — `{ thumbnail, hero, video, videos: VideoItem[], gallery: string[] }`
- `content` — `{ problem, solution, coreLoop, systems, uxFlow, outcome }`
- `tools`, `responsibilities`, `role`, `team`, `duration`, `platform`

Core loop steps are stored as `" -> "` separated strings and split by `ProjectPage`.

## Routes

- `/` → `Index` (hero + work grid)
- `/project/:id` → `ProjectPage` (full case study)

## Design Tokens

CSS custom properties defined in `src/index.css`. Gold accent: `--gold: 51 100% 50%`. Dark theme only (no light mode switch in UI).

## Adding a New Project

1. Add video IDs to `videoIds` and thumbnail path to `projectImages` in `projects.ts`
2. Push image to `public/projects/<slug>.jpg`
3. Add full `Project` object to `projectsData` array

## Context Ignore

Large binary assets (images, lockfiles, public folder) are listed in `.contextignore` — they are excluded from context scans to reduce token overhead.
