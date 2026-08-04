# Cars24 SDUI

Server-Driven UI system for the Cars24 Home/Landing page. The server sends
JSON; the client renders it. Changing the JSON changes the UI — no app
release needed.

Built with React Native 0.86 + TypeScript, as a single-platform assessment
project (not a production app).

## Setup

```sh
pnpm install

# iOS only, first run and after any native dep change
bundle install
bundle exec pod install --project-directory=ios

pnpm start        # Metro
pnpm android       # or
pnpm ios
```

Two screens are registered in the stack navigator:

- `HomeSDUI` — the JSON-driven page (`src/features/home`)
- `HomeStatic` — the same page hardcoded, for perf comparison (`src/features/static`)

## Architecture

```text
JSON (MockData.ts locally, or a hosted endpoint)
      ↓
useHomePage()            TanStack Query — fetch, cache, retry
      ↓
Screen.tsx                loading / error / skeleton states
      ↓
SDUIRenderer.tsx           FlashList over sections[]
      ↓
ComponentRegistry.ts       type string → React component
      ↓
SDUIErrorBoundary          class component — catches render errors per section
      ↓
ActionHandler.ts            centralizes all tap → navigate/state/sheet dispatch
      ↓
Native RN components        the actual views
```

Every section is wrapped in its own `SDUIErrorBoundary`. One malformed
component can't take down the page — it falls back to
`UnknownFallbackComponent` and the rest of the list keeps rendering.

## Schema

```ts
type SDUIPage = {
  version: string;       // semver
  screen_id: string;
  sections: SDUIComponent[];
};

type SDUIComponent = {
  id: string;             // stable, used as list key
  type: string;           // → ComponentRegistry key
  props: Record<string, unknown>;
  action?: SDUIAction;
  fallback?: 'hide' | 'placeholder' | 'skeleton';
  layout?: SDUILayout;    // server-driven style overrides
  metadata?: SDUIMetadata; // analytics + A/B testing
};
```

**Why `type` as a string, not an enum?** A string lets the server ship a
brand-new component type without a client release. An enum would need a
client code change (and app store review) for every new section type —
defeating the point of SDUI.

**Why `metadata`?** Cars24 tracks impressions on every rendered section.
`analytics_id` + `log_impression` let the server opt sections into tracking
without the client hardcoding which sections matter. `experiment_id` makes
SDUI double as an A/B testing layer — the server decides which variant a
user sees, zero client change.

**Why no visibility conditions?** The original design considered a
`SDUIVisibility` field with a string condition the client would `eval()`.
Removed it — evaluating server-sent strings as code is a straightforward
injection vector. The client should never execute logic it didn't ship
with. Conditional rendering is handled server-side instead: if a section
shouldn't render for a user, the server simply omits it from `sections[]`.

**Why ErrorBoundary instead of try/catch?** React doesn't propagate
render-phase errors to a surrounding try/catch — they only reach
`componentDidCatch`/`getDerivedStateFromError` on a class component above
the failing subtree. `SDUIErrorBoundary` wraps each section individually so
one bad component degrades to a fallback instead of crashing the screen.

**Why does each `category_chips` item carry its own `action`, not the
section?** Buy/Sell/Loan/RC Transfer are functionally different — three do
`update_state`, one does `navigate`. A single section-level action can't
express four different behaviors, so the action lives per chip.

**Why semver on every payload?** Old client + new JSON: unknown component
types render nothing (prod) via `UnknownFallbackComponent`, page still
works. New client + old JSON: new components simply don't appear in the
payload. A MAJOR version bump is the only case that should prompt
"please update your app" — MINOR/PATCH are fully backward compatible.

## Known trade-offs

1. **No real network layer.** `fetchHomePage()` returns local `MockData`
   with a simulated 80ms delay. `HttpsClient.ts` (Axios instance) is wired
   and ready — swapping to a real endpoint is a one-line change in
   `GetApiServices.ts`. Production would add caching, retry/backoff, and
   stale-while-revalidate (TanStack Query already gives most of this for
   free once a real URL is in place).
2. **Icons are a single glyph, not Ionicons.** The JSON references icon
   names like `shield-checkmark` / `car-outline`, but `react-native-vector-icons`
   wasn't part of the planned dependency set, so `ValuePropStripComponent`
   renders a plain checkmark instead of resolving those names. Would add
   the icon library if exact icons mattered.
3. **`@d11/react-native-fast-image`, not the original.** The unmaintained
   original doesn't declare React 19 support (peer dep caps at React 18).
   The `@d11` fork is the maintained, New Architecture–compatible drop-in
   replacement with an identical API.
4. **Perf numbers not yet measured on-device.** See [PERF.md](PERF.md) —
   the release APK builds clean and the `perf.ts` markers are wired into
   real code paths, but this environment has no physical Android device to
   run the cold-open methodology on.

## Folder structure

See `CLAUDE.md` for the full planned structure. Actual layout matches it,
with `src/sdui/`, `src/components/`, `src/features/{home,static}/`,
`src/stores/`, `src/services/`, `src/navigation/`.
