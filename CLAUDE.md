# CLAUDE.md — Cars24 SDUI Assignment

## Project Overview
Server-Driven UI (SDUI) system for Cars24 Mobile Engineering assessment.
Build a React Native app where the server sends JSON and the client renders
the page — no app release needed for UI changes.

**Timebox:** 72 hours | **Focused effort:** ~8–10 hours with AI leverage
**Platform:** React Native + TypeScript (single stack, done deeply)
**Screen chosen:** Cars24 Home/Landing Page

---

## What SDUI Means Here

Instead of hardcoded UI:
```tsx
// ❌ Hardcoded — requires app release to change
<BannerCarousel images={[...]} />
<CategoryChips items={[...]} />
```

We render from JSON:
```json
{
  "type": "banner_carousel",
  "props": { "images": [...], "autoplay": true }
}
```

The renderer maps `type` → component. Change JSON → UI changes everywhere.
No app release needed.

---

## Core Architecture

```
JSON (local file / hosted endpoint)
      ↓
SDUIScreen.tsx             ← loads JSON, passes to renderer
      ↓
SDUIRenderer.tsx           ← reads sections[], resolves components
      ↓
ComponentRegistry.ts       ← { "banner_carousel": BannerCarouselComponent }
      ↓
SDUIErrorBoundary.tsx      ← catches render errors, shows fallback
      ↓
ActionHandler.ts           ← centralized tap/navigate/state handling
      ↓
Native RN Components       ← actual views
```

---

## JSON Schema

```typescript
// schema.types.ts

export type SDUIPage = {
  version: string;            // "1.0.0" — semver for versioning story
  screen_id: string;          // "home_landing"
  sections: SDUIComponent[];
};

export type SDUIComponent = {
  id: string;                 // unique, stable — used as FlatList key
  type: string;               // maps to ComponentRegistry key
  props: Record<string, unknown>;
  action?: SDUIAction;        // section-level action (optional)
  fallback?: 'hide' | 'placeholder' | 'skeleton';
  layout?: SDUILayout;        // styling overrides from server
  metadata?: SDUIMetadata;    // analytics + A/B testing — product company must-have
};

// Analytics + A/B testing metadata — Cars24 tracks every component impression
export type SDUIMetadata = {
  analytics_id?: string;      // e.g. "home_banner_v2" — for impression tracking
  experiment_id?: string;     // A/B test ID — server controls which variant renders
  log_impression?: boolean;   // whether to fire an impression event on render
};

// ✅ ADDED: layout support — Cars24 assessment mentions styling overrides
export type SDUILayout = {
  padding?: number;
  margin?: number;
  backgroundColor?: string;
  borderRadius?: number;
};

export type SDUIAction = {
  type: 'navigate' | 'update_state' | 'open_sheet' | 'filter' | 'external_url';
  payload: Record<string, unknown>;
};

// ⚠️ REMOVED: SDUIVisibility with string condition eval
// Reason: eval() is a security risk and gets flagged in code review
// Use server-side filtering instead — don't send sections
// the client shouldn't render
```

---

## Component Registry

```typescript
// ComponentRegistry.ts

import { HeaderComponent }         from '../components/HeaderComponent';
import { BannerCarouselComponent }  from '../components/BannerCarouselComponent';
import { CategoryChipsComponent }   from '../components/CategoryChipsComponent';
import { CarCardRailComponent }     from '../components/CarCardRailComponent';
import { ValuePropStripComponent }  from '../components/ValuePropStripComponent';
import { FooterCTAComponent }       from '../components/FooterCTAComponent';
import { UnknownFallbackComponent } from '../components/UnknownFallbackComponent';

export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  'header':           HeaderComponent,
  'banner_carousel':  BannerCarouselComponent,
  'category_chips':   CategoryChipsComponent,
  'car_card_rail':    CarCardRailComponent,
  'value_prop_strip': ValuePropStripComponent,
  'footer_cta':       FooterCTAComponent,
};

export const resolveComponent = (type: string): React.ComponentType<any> => {
  return COMPONENT_REGISTRY[type] ?? UnknownFallbackComponent;
};
```

---

## SDUIRenderer (Corrected)

```tsx
// SDUIRenderer.tsx
// ⚠️ IMPORTANT: Do NOT use try/catch for render errors in React.
// React render errors don't propagate to try/catch.
// Use ErrorBoundary class component instead (see below).

const SDUIRenderer: React.FC<{ page: SDUIPage }> = ({ page }) => {
  return (
    <FlashList
      data={page.sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <SDUIErrorBoundary componentType={item.type}>
          <SDUIComponentRenderer component={item} />
        </SDUIErrorBoundary>
      )}
      estimatedItemSize={200}
      showsVerticalScrollIndicator={false}
    />
  );
};

const SDUIComponentRenderer: React.FC<{ component: SDUIComponent }> = ({
  component,
}) => {
  const Component = resolveComponent(component.type);
  return (
    <Component
      {...component.props}
      action={component.action}
      layout={component.layout}
    />
  );
};
```

---

## SDUIErrorBoundary (Required — Replaces try/catch)

```tsx
// sdui/SDUIErrorBoundary.tsx
// ✅ CORRECT way to catch React render errors
// try/catch does NOT work for render errors in React

interface Props {
  children: React.ReactNode;
  componentType: string;
}

interface State {
  hasError: boolean;
}

export class SDUIErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to Crashlytics in production
    console.warn(
      `SDUI render error for component: ${this.props.componentType}`,
      error,
      info
    );
  }

  render() {
    if (this.state.hasError) {
      return <UnknownFallbackComponent type={this.props.componentType} />;
    }
    return this.props.children;
  }
}
```

---

## ActionHandler (Corrected)

```typescript
// ActionHandler.ts
// ✅ Centralized action dispatch — all taps go through here

import { NavigationProp } from '@react-navigation/native';
import { Linking } from 'react-native';
import { SDUIAction } from './schema.types';

export const handleAction = (
  action: SDUIAction | undefined,
  navigation: NavigationProp<any>,
  setState: (key: string, value: unknown) => void,
  openSheet: (sheetId: string) => void
): void => {
  if (!action) return;

  switch (action.type) {
    case 'navigate':
      navigation.navigate(
        action.payload.screen as string,
        action.payload
      );
      break;

    case 'update_state':
      setState(
        action.payload.key as string,
        action.payload.value
      );
      break;

    case 'open_sheet':
      openSheet(action.payload.sheet_id as string);
      break;

    case 'external_url':
      Linking.openURL(action.payload.url as string).catch(console.warn);
      break;

    case 'filter':
      setState('activeFilter', action.payload.filter_id);
      break;

    default:
      // ✅ Unknown action type — log, never crash
      console.warn(`Unknown SDUI action type: ${(action as any).type}`);
  }
};
```

---

## Unknown Component Fallback

```tsx
// UnknownFallbackComponent.tsx
// ✅ MUST demo this in screen recording — add unknown type to JSON

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  type?: string;
}

export const UnknownFallbackComponent: React.FC<Props> = ({ type }) => {
  if (__DEV__) {
    // Dev: show warning so developer knows something is missing
    return (
      <View style={styles.devContainer}>
        <Text style={styles.devText}>⚠️ Unknown component: "{type}"</Text>
        <Text style={styles.devSubtext}>Register in ComponentRegistry</Text>
      </View>
    );
  }
  // ✅ Production: render nothing — page continues, never crashes
  return null;
};
```

---

## Home Screen JSON (Mock Server — Complete Data)

```json
{
  "version": "1.0.0",
  "screen_id": "home_landing",
  "sections": [
    {
      "id": "header_001",
      "type": "header",
      "props": {
        "logo_url": "https://picsum.photos/seed/logo/80/40",
        "search_placeholder": "Search cars, brands, budget...",
        "location": "Chennai",
        "notification_count": 3
      }
    },
    {
      "id": "banner_001",
      "type": "banner_carousel",
      "props": {
        "autoplay": true,
        "interval_ms": 3000,
        "items": [
          {
            "id": "b1",
            "image_url": "https://picsum.photos/seed/cars_banner1/800/300",
            "title": "Best deals this week",
            "cta_text": "Explore",
            "action": { "type": "navigate", "payload": { "screen": "deals" } }
          },
          {
            "id": "b2",
            "image_url": "https://picsum.photos/seed/cars_banner2/800/300",
            "title": "Up to ₹50,000 off",
            "cta_text": "View Offers",
            "action": { "type": "navigate", "payload": { "screen": "offers" } }
          },
          {
            "id": "b3",
            "image_url": "https://picsum.photos/seed/cars_banner3/800/300",
            "title": "Sell your car in 24hrs",
            "cta_text": "Get Quote",
            "action": { "type": "open_sheet", "payload": { "sheet_id": "sell_flow" } }
          }
        ]
      }
    },
    {
      "id": "chips_001",
      "type": "category_chips",
      "props": {
        "selected_id": "buy",
        "items": [
          {
            "id": "buy",
            "label": "Buy",
            "icon": "car-outline",
            "action": { "type": "update_state", "payload": { "key": "selectedCategory", "value": "buy" } }
          },
          {
            "id": "sell",
            "label": "Sell",
            "icon": "pricetag-outline",
            "action": { "type": "update_state", "payload": { "key": "selectedCategory", "value": "sell" } }
          },
          {
            "id": "loan",
            "label": "Loan",
            "icon": "card-outline",
            "action": { "type": "update_state", "payload": { "key": "selectedCategory", "value": "loan" } }
          },
          {
            "id": "rc",
            "label": "RC Transfer",
            "icon": "document-outline",
            "action": { "type": "navigate", "payload": { "screen": "rc_transfer" } }
          }
        ]
      }
    },
    {
      "id": "car_rail_001",
      "type": "car_card_rail",
      "props": {
        "title": "Recently Added",
        "subtitle": "Fresh cars in Chennai",
        "items": [
          {
            "id": "car1",
            "name": "Maruti Swift VXi",
            "year": 2021,
            "km": "32,000 km",
            "price": "₹5.75 L",
            "emi": "₹10,200/mo",
            "image_url": "https://picsum.photos/seed/swift/300/200",
            "badge": "CERTIFIED",
            "action": { "type": "navigate", "payload": { "screen": "car_detail", "car_id": "car1" } }
          },
          {
            "id": "car2",
            "name": "Honda City ZX",
            "year": 2020,
            "km": "45,000 km",
            "price": "₹8.25 L",
            "emi": "₹14,600/mo",
            "image_url": "https://picsum.photos/seed/city/300/200",
            "badge": "TOP RATED",
            "action": { "type": "navigate", "payload": { "screen": "car_detail", "car_id": "car2" } }
          },
          {
            "id": "car3",
            "name": "Hyundai Creta SX",
            "year": 2022,
            "km": "18,000 km",
            "price": "₹12.50 L",
            "emi": "₹22,100/mo",
            "image_url": "https://picsum.photos/seed/creta/300/200",
            "badge": "HOT DEAL",
            "action": { "type": "navigate", "payload": { "screen": "car_detail", "car_id": "car3" } }
          },
          {
            "id": "car4",
            "name": "Tata Nexon XZ+",
            "year": 2021,
            "km": "28,500 km",
            "price": "₹9.80 L",
            "emi": "₹17,400/mo",
            "image_url": "https://picsum.photos/seed/nexon/300/200",
            "badge": "CERTIFIED",
            "action": { "type": "navigate", "payload": { "screen": "car_detail", "car_id": "car4" } }
          },
          {
            "id": "car5",
            "name": "Kia Seltos HTX",
            "year": 2020,
            "km": "52,000 km",
            "price": "₹11.20 L",
            "emi": "₹19,800/mo",
            "image_url": "https://picsum.photos/seed/seltos/300/200",
            "badge": "PRICE DROP",
            "action": { "type": "navigate", "payload": { "screen": "car_detail", "car_id": "car5" } }
          }
        ]
      }
    },
    {
      "id": "value_prop_001",
      "type": "value_prop_strip",
      "props": {
        "items": [
          { "icon": "shield-checkmark", "title": "200+ Inspections", "subtitle": "Every car checked" },
          { "icon": "refresh-circle",   "title": "7-Day Returns",    "subtitle": "No questions asked" },
          { "icon": "star",             "title": "1-Year Warranty",  "subtitle": "Peace of mind" },
          { "icon": "cash",             "title": "Best Price",       "subtitle": "Price match guarantee" }
        ]
      }
    },
    {
      "id": "unknown_test_001",
      "type": "holographic_display",
      "props": { "message": "Future feature — not yet in client" },
      "fallback": "hide"
    },
    {
      "id": "footer_cta_001",
      "type": "footer_cta",
      "props": {
        "title": "Sell your car in 24 hours",
        "subtitle": "Get the best price guaranteed",
        "cta_text": "Get Free Quote",
        "background_color": "#FF6B00",
        "action": {
          "type": "open_sheet",
          "payload": { "sheet_id": "sell_flow" }
        }
      },
      "layout": {
        "margin": 16,
        "borderRadius": 12
      }
    }
  ]
}
```

---

## Folder Structure

Following the LearnFlow / ALive project convention — feature-based with Screen.tsx + useScreen.ts pairs.

```
cars24-sdui/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   └── cars24_logo.png      # Cars24 logo
│   │   └── lotties/
│   │       └── loading.json         # Loading animation
│   │
│   ├── components/
│   │   ├── cards/
│   │   │   └── CarCard.tsx          # Reusable car card (used in rail)
│   │   ├── HeaderComponent.tsx      # Search + location + notif
│   │   ├── BannerCarouselComponent.tsx  # Auto-scrolling banners
│   │   ├── CategoryChipsComponent.tsx   # Buy/Sell/Loan chips
│   │   ├── CarCardRailComponent.tsx     # Horizontal car rail
│   │   ├── ValuePropStripComponent.tsx  # 200+ inspections strip
│   │   ├── FooterCTAComponent.tsx       # Sell CTA
│   │   └── UnknownFallbackComponent.tsx # Graceful degradation
│   │
│   ├── constants/
│   │   ├── Colors.ts                # Color tokens
│   │   ├── AppConstants.ts          # App-wide constants
│   │   └── MockData.ts              # home_screen.json equivalent
│   │
│   ├── enums/
│   │   └── RouteEnum.ts             # Screen name enums
│   │
│   ├── features/
│   │   ├── home/
│   │   │   ├── Screen.tsx           # SDUI home screen UI
│   │   │   └── useScreen.ts         # JSON loading, state, actions
│   │   └── static/
│   │       ├── Screen.tsx           # Hardcoded version (benchmarking)
│   │       └── useScreen.ts         # Static screen logic
│   │
│   ├── navigation/
│   │   ├── Router.tsx               # Root stack navigator
│   │   ├── NavigationParamList.ts   # Typed route params
│   │   └── RootNavigation.ts        # navigationRef
│   │
│   ├── sdui/
│   │   ├── SDUIRenderer.tsx         # Core renderer — maps JSON → components
│   │   ├── SDUIErrorBoundary.tsx    # Error boundary (class component)
│   │   ├── ComponentRegistry.ts     # Type → Component map
│   │   ├── ActionHandler.ts         # Centralized action dispatch
│   │   └── schema.types.ts          # SDUIPage, SDUIComponent, SDUIAction
│   │
│   ├── services/
│   │   ├── HttpsClient.ts           # Axios instance (REST-ready for real server)
│   │   ├── apiServices/
│   │   │   └── GetApiServices.ts    # fetchHomePage() — returns SDUIPage
│   │   └── constants/
│   │       ├── ApiConstants.ts      # BASE_URL + endpoint constants
│   │       └── QueryKeys.ts         # TanStack Query key constants
│   │
│   ├── stores/
│   │   ├── sduiStore.ts             # Zustand — selected chip, sheet state only
│   │   └── hooks/
│   │       ├── useSDUIStore.ts      # Typed Zustand hook
│   │       └── useHomePage.ts       # TanStack Query hook — fetches SDUIPage JSON
│   │
│   ├── storage/
│   │   ├── MMKV.ts                  # MMKV instance
│   │   ├── LocalStore.ts            # Typed get/set helpers
│   │   └── StorageKeys.ts           # Storage key constants
│   │
│   └── types/
│       └── index.ts                 # CarItem, BannerItem, ChipItem types
│
├── README.md
├── PERF.md
├── COVERAGE.md
└── AI_WORKFLOW.md
```

---


## TanStack Query Integration

```typescript
// services/constants/QueryKeys.ts
export const QUERY_KEYS = {
  HOME_PAGE: ['sdui', 'home_page'] as const,
};

// services/apiServices/GetApiServices.ts
import HttpsClient from '../HttpsClient';
import { SDUIPage } from '../../sdui/schema.types';
import MockData from '../../constants/MockData';

export const fetchHomePage = async (): Promise<SDUIPage> => {
  // For local JSON — simulate network latency
  await new Promise(resolve => setTimeout(resolve, 80));
  return MockData as SDUIPage;

  // For real server — swap to:
  // const response = await HttpsClient.get<SDUIPage>('/api/screen/home');
  // return response.data;
};

// stores/hooks/useHomePage.ts
// TanStack Query hook — replaces manual loading/error state in useScreen.ts
import { useQuery } from '@tanstack/react-query';
import { fetchHomePage } from '../../services/apiServices/GetApiServices';
import { QUERY_KEYS } from '../../services/constants/QueryKeys';

export const useHomePage = () => {
  return useQuery({
    queryKey: QUERY_KEYS.HOME_PAGE,
    queryFn: fetchHomePage,
    staleTime: 5 * 60 * 1000,   // 5 minutes — page doesn't change frequently
    gcTime: 10 * 60 * 1000,     // 10 minutes cache
    retry: 2,                    // retry twice on failure
  });
};
```

**In features/home/useScreen.ts:**
```typescript
// Use TanStack Query hook instead of manual useState + useEffect
import { useHomePage } from '../../stores/hooks/useHomePage';

export const useScreen = () => {
  const { data: page, isLoading, isError, refetch } = useHomePage();
  // data is SDUIPage | undefined
  // isLoading covers both initial load and background refresh
  // isError handles fetch failures
  return { page, isLoading, isError, refetch };
};
```

**Zustand (sduiStore.ts) handles UI state only:**
```typescript
// Zustand = local UI state (what chip is selected, which sheet is open)
// TanStack Query = server state (the JSON page data)
type SDUIStore = {
  selectedChipId: string;
  activeSheetId: string | null;
  setSelectedChip: (id: string) => void;
  openSheet: (id: string) => void;
  closeSheet: () => void;
};
```

**QueryClient setup in App.tsx:**
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}
```

---

## perf.ts — Performance Helper

```typescript
// utils/perf.ts
// ✅ Defined — was missing from previous version

export class PerfTracker {
  private marks: Record<string, number> = {};

  mark(label: string): void {
    this.marks[label] = performance.now();
  }

  measure(startLabel: string, endLabel: string): number {
    const start = this.marks[startLabel] ?? 0;
    const end = this.marks[endLabel] ?? performance.now();
    return Math.round(end - start);
  }

  report(): Record<string, number> {
    return {
      json_parse_ms: this.measure('fetch_start', 'parse_complete'),
      view_build_ms: this.measure('render_start', 'render_complete'),
      ttr_ms:        this.measure('app_start', 'above_fold_visible'),
      tti_ms:        this.measure('app_start', 'interactive'),
    };
  }
}

export const perf = new PerfTracker();
```

---

## Versioning Story

```
Version field in every JSON payload: "version": "1.0.0"

Semver strategy:
- MAJOR (1.x → 2.x): Breaking schema change
  → Client checks major version, shows "Please update your app"
- MINOR (1.0 → 1.1): New component types added
  → Old clients use UnknownFallbackComponent gracefully
- PATCH (1.0.0 → 1.0.1): Prop changes, content updates only
  → Fully backward compatible, no client changes needed

Old app + new JSON: Unknown types → fallback (never crashes)
New app + old JSON: New components simply don't appear
This is the core graceful degradation guarantee.
```

---

## Performance Measurement

Build BOTH versions in **release mode** (not debug — debug is 3-5x slower):

```bash
# Android release build
cd android && ./gradlew assembleRelease
# Install on physical device
adb install app/build/outputs/apk/release/app-release.apk
```

**Methodology:**
- Kill app completely between each run (force stop)
- Run 5 cold opens for each version
- Average the results
- Measure with perf.ts markers + Android Profiler for frames

**PERF.md template:**
```markdown
# Performance Comparison

Device: [your device model, Android version]
Build: Release APK
Runs: 5 cold opens each, averaged

| Metric        | Static    | SDUI      | Overhead |
|---------------|-----------|-----------|----------|
| TTR           | ___ms     | ___ms     | ___%     |
| TTI           | ___ms     | ___ms     | ___%     |
| Full page     | ___ms     | ___ms     | ___%     |
| JSON parse    | N/A       | ___ms     | -        |
| View build    | N/A       | ___ms     | -        |
| Dropped frames| ___       | ___       | -        |

Optimizations attempted:
1. FlashList with estimatedItemSize — reduced jank on scroll
2. useMemo on resolveComponent — avoided registry lookup per render
3. [what else you tried]

What worked: [honest assessment]
What didn't: [honest assessment]
```

---

## COVERAGE.md Template

```markdown
# SDUI Coverage Analysis

## Component Registry
| Type             | Built | JSON-only? | Notes                        |
|------------------|-------|------------|------------------------------|
| header           | ✅    | Yes        | Search, location, notifs     |
| banner_carousel  | ✅    | Yes        | Autoplay, CTA, actions       |
| category_chips   | ✅    | Yes        | Each chip has own action     |
| car_card_rail    | ✅    | Yes        | Horizontal scroll, badges    |
| value_prop_strip | ✅    | Yes        | Icon + title + subtitle      |
| footer_cta       | ✅    | Yes        | Layout overrides supported   |

## Honest Coverage Claim
Given a new Cars24 screen:
~75% renders with JSON-only changes

Patterns that would need new client code:
- Video/media players
- Map/location views
- Custom gesture interactions (swipe-to-dismiss etc.)
- Chart or graph components
- Biometric or device API components

## Extension Speed
Adding a new component: ~20–30 minutes
1. Define TypeScript props type in schema.types.ts
2. Build the React Native component
3. Register in ComponentRegistry.ts
4. Add JSON entry to mock data
```

---

## Additional Important Details

### 1. Skeleton Loading State
```tsx
// features/home/Screen.tsx
const { data: page, isLoading, isError } = useHomePage();

if (isLoading) return <SDUISkeleton />;  // show skeleton, not spinner
if (isError)   return <SDUIErrorState onRetry={refetch} />;
return <SDUIRenderer page={page} />;

// SDUISkeleton — mimics the home page layout with grey placeholders
// At minimum: header skeleton + banner skeleton + 2 card skeletons
```

### 2. useMemo on ComponentRegistry Lookup
```tsx
// SDUIRenderer.tsx — avoid registry lookup on every re-render
const SDUIComponentRenderer: React.FC<{ component: SDUIComponent }> = ({
  component,
}) => {
  // ✅ Memoize — resolveComponent is called on every render otherwise
  const Component = useMemo(
    () => resolveComponent(component.type),
    [component.type]
  );

  return (
    <Component
      {...component.props}
      action={component.action}
      layout={component.layout}
    />
  );
};
```

### 3. react-native-fast-image for Car Images
```
Install: react-native-fast-image

Why: Car images are the heaviest render cost.
FastImage uses shared image cache — images don't re-download
as user scrolls back up the car rail.

Usage in CarCard.tsx:
import FastImage from 'react-native-fast-image';
<FastImage
  source={{ uri: item.image_url, priority: FastImage.priority.normal }}
  resizeMode={FastImage.resizeMode.cover}
  style={styles.carImage}
/>
```

### 4. Analytics Impression Tracking
```tsx
// When metadata.log_impression = true, fire an analytics event
// Add to SDUIComponentRenderer:
useEffect(() => {
  if (component.metadata?.log_impression) {
    // In production: Analytics.logImpression(component.metadata.analytics_id)
    console.log('[SDUI] Impression:', component.metadata.analytics_id);
  }
}, [component.id]);
```

### 5. Deep Linking in ActionHandler
```typescript
// Cars24 uses deep links heavily — handle external URLs properly
case 'navigate':
  const screen = action.payload.screen as string;
  if (screen.startsWith('http')) {
    // External deep link
    Linking.openURL(screen);
  } else {
    // Internal navigation
    navigation.navigate(screen, action.payload);
  }
  break;
```

### 6. What to Say in Debrief About Schema Design
Cars24 will ask "why did you design the schema this way?"

Prepared answers:
- **Why `type` as string not enum?** — String allows server to send new types
  without a client update. Enum would require client code change for every new component.
- **Why `metadata` field?** — Product companies need analytics. Every rendered
  section should be trackable without touching client code.
- **Why `experiment_id`?** — SDUI is the perfect A/B testing layer. Server sends
  variant A to 50% of users, variant B to the other 50%. Zero client code change.
- **Why remove visibility conditions?** — eval() is a security risk.
  Server-side filtering is cleaner — just don't send what you don't want rendered.
- **Why semver versioning?** — Old app users still get a working page.
  Unknown components degrade gracefully. Major version mismatch prompts update.

---

## Build Steps

Tell Claude Code: **"Read CLAUDE.md. Do Step N only."**

**Step 1 — Project setup**
```
npx react-native init Cars24SDUI --template react-native-template-typescript
Install dependencies:
  @shopify/flash-list
  zustand
  @tanstack/react-query
  axios
  @react-navigation/native
  @react-navigation/stack
  react-native-screens
  react-native-safe-area-context
  react-native-fast-image
```


## Responsive Dimensions — Phone & Tablet

Cars24 app runs on phones AND tablets. SDUI components must adapt to screen size.

### Dimensions Utility

```typescript
// utils/Dimensions.ts
import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Tablet detection — iPad/Android tablet
export const IS_TABLET = SCREEN_WIDTH >= 768;

// Scale factor — base design is 375px wide (iPhone 14)
const BASE_WIDTH = 375;
const scale = SCREEN_WIDTH / BASE_WIDTH;

// Responsive font size — scales with screen width
export const rf = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel(size * Math.min(scale, 1.4)));

// Responsive size — for padding, margin, icon sizes
export const rs = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel(size * scale));

// Responsive width — percentage of screen width
export const rw = (percent: number): number =>
  Math.round((SCREEN_WIDTH * percent) / 100);

// Responsive height — percentage of screen height
export const rh = (percent: number): number =>
  Math.round((SCREEN_HEIGHT * percent) / 100);

// Column count — 2 on phone, 3 on tablet
export const GRID_COLUMNS = IS_TABLET ? 3 : 2;

// Card width based on columns + gap
const CARD_GAP = rs(12);
const HORIZONTAL_PADDING = rs(16);
export const CAR_CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * (GRID_COLUMNS - 1)) /
  GRID_COLUMNS;

// Banner height — proportional
export const BANNER_HEIGHT = IS_TABLET ? rh(25) : rh(22);

// Chip height
export const CHIP_HEIGHT = IS_TABLET ? rs(44) : rs(36);

export { SCREEN_WIDTH, SCREEN_HEIGHT };
```

---

### How Each Component Uses Dimensions

```typescript
// HeaderComponent.tsx
import { rf, rs, IS_TABLET } from '../../utils/Dimensions';

const styles = StyleSheet.create({
  container: {
    height: IS_TABLET ? rs(72) : rs(56),
    paddingHorizontal: rs(16),
  },
  searchInput: {
    fontSize: rf(14),
    height: IS_TABLET ? rs(44) : rs(36),
  },
  locationText: {
    fontSize: rf(13),
  },
});

// BannerCarouselComponent.tsx
import { BANNER_HEIGHT, SCREEN_WIDTH } from '../../utils/Dimensions';

const styles = StyleSheet.create({
  banner: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,      // phone: ~22% screen, tablet: ~25% screen
  },
});

// CarCardRailComponent.tsx — horizontal scroll
import { CAR_CARD_WIDTH, rs } from '../../utils/Dimensions';

const styles = StyleSheet.create({
  card: {
    width: CAR_CARD_WIDTH,      // auto-calculated for 2 or 3 columns
    marginRight: rs(12),
    borderRadius: rs(8),
  },
  carImage: {
    width: '100%',
    height: CAR_CARD_WIDTH * 0.65,  // maintain aspect ratio
  },
  price: {
    fontSize: rf(16),
    fontWeight: '700',
  },
  emi: {
    fontSize: rf(12),
  },
});

// CategoryChipsComponent.tsx
import { CHIP_HEIGHT, rf, rs } from '../../utils/Dimensions';

const styles = StyleSheet.create({
  chip: {
    height: CHIP_HEIGHT,
    paddingHorizontal: rs(14),
    borderRadius: CHIP_HEIGHT / 2,  // pill shape always
  },
  chipLabel: {
    fontSize: rf(13),
  },
});

// FooterCTAComponent.tsx
import { rs, rf, IS_TABLET, rw } from '../../utils/Dimensions';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: rs(16),
    padding: rs(20),
    borderRadius: rs(12),
    // Tablet: limit width so it doesn't stretch too wide
    maxWidth: IS_TABLET ? rw(60) : undefined,
    alignSelf: IS_TABLET ? 'center' : 'stretch',
  },
  ctaButton: {
    height: IS_TABLET ? rs(52) : rs(44),
    borderRadius: rs(8),
  },
  title: {
    fontSize: rf(IS_TABLET ? 20 : 16),
    fontWeight: '700',
  },
  subtitle: {
    fontSize: rf(IS_TABLET ? 15 : 13),
  },
});
```

---

### SDUILayout Tablet Override

The `layout` prop in schema supports tablet overrides from server:

```json
{
  "id": "footer_cta_001",
  "type": "footer_cta",
  "props": { ... },
  "layout": {
    "margin": 16,
    "borderRadius": 12,
    "maxWidth": 600
  }
}
```

```typescript
// In FooterCTAComponent.tsx — apply layout overrides
const FooterCTAComponent: React.FC<FooterCTAProps> = ({ layout, ...props }) => {
  return (
    <View style={[
      styles.container,
      layout?.margin && { margin: layout.margin },
      layout?.borderRadius && { borderRadius: layout.borderRadius },
      layout?.maxWidth && { maxWidth: layout.maxWidth },
    ]}>
      ...
    </View>
  );
};
```

---

### Tablet-Specific Layout Differences

| Component | Phone | Tablet |
|---|---|---|
| Header height | 56px | 72px |
| Banner height | ~22% screen | ~25% screen |
| Car rail columns | 2 | 3 |
| Chip height | 36px | 44px |
| Footer CTA | full width | centered, max 60% width |
| Font scale | base | +15% max |
| Horizontal padding | 16px | 24px |

---

### Dimensions in COVERAGE.md

Add this to your honest coverage claim:

```markdown
## Responsive Design
- Phone (375–428px): 2-column car grid, 56px header
- Tablet (768px+): 3-column car grid, 72px header, 
  centered CTAs with maxWidth
- Tested on: [your phone model] + [Android tablet / iPad simulator]
- Font scaling: uses PixelRatio.roundToNearestPixel for crisp text
```

---

### Add to Step 2 Build Steps

```
src/utils/Dimensions.ts — rs(), rf(), rw(), rh(), IS_TABLET, CAR_CARD_WIDTH
```

---

## Colors.ts — Cars24 Brand Tokens

```typescript
// constants/Colors.ts
export const Colors = {
  // Cars24 brand
  primary:        '#FF6B00',    // Cars24 orange — CTAs, active states
  primaryDark:    '#E55A00',    // Darker orange — pressed state
  primaryLight:   '#FFF0E6',    // Light orange bg — chip selected bg

  // UI
  background:     '#F5F5F5',    // Page background
  surface:        '#FFFFFF',    // Card background
  surfaceElevated:'#FFFFFF',    // Elevated card

  // Text
  textPrimary:    '#1A1A1A',    // Main text
  textSecondary:  '#666666',    // Subtitle text
  textDisabled:   '#AAAAAA',    // Disabled / placeholder

  // Status
  success:        '#27AE60',    // CERTIFIED badge
  warning:        '#F2994A',    // HOT DEAL badge
  error:          '#EB5757',    // Error states

  // Border
  border:         '#E8E8E8',    // Card borders
  divider:        '#F0F0F0',    // Section dividers

  // Overlay
  overlay:        'rgba(0,0,0,0.5)',  // Bottom sheet backdrop
};
```

---

**Step 2 — Types + Constants + Mock Data**
- `src/sdui/schema.types.ts` — SDUIPage, SDUIComponent, SDUIAction, SDUILayout
- `src/types/index.ts` — CarItem, BannerItem, ChipItem domain types
- `src/constants/Colors.ts` — Cars24 color tokens
- `src/constants/AppConstants.ts` — app-wide constants
- `src/constants/MockData.ts` — home_screen JSON (use the JSON above)
- `src/enums/RouteEnum.ts` — screen name enums
- `src/storage/StorageKeys.ts` — storage keys
- `src/utils/Dimensions.ts` — rs(), rf(), rw(), rh(), IS_TABLET, CAR_CARD_WIDTH

**Step 3 — Storage + Stores**
- `src/storage/MMKV.ts` — MMKV instance
- `src/storage/LocalStore.ts` — typed get/set helpers
- `src/stores/sduiStore.ts` — Zustand store (UI state only: chip, sheet)
- `src/stores/hooks/useSDUIStore.ts` — typed Zustand hook
- `src/services/constants/QueryKeys.ts` — query key constants
- `src/stores/hooks/useHomePage.ts` — TanStack Query hook

**Step 4 — Services**
- `src/services/constants/ApiConstants.ts` — BASE_URL + endpoints
- `src/services/HttpsClient.ts` — Axios instance (REST-ready)
- `src/services/apiServices/GetApiServices.ts` — fetchHomePage()
- Set up QueryClientProvider in App.tsx

**Step 5 — Registry + Fallback + Error Boundary**
- `src/sdui/ComponentRegistry.ts` — type → component map
- `src/components/UnknownFallbackComponent.tsx` — graceful degradation
- `src/sdui/SDUIErrorBoundary.tsx` — class component (not try/catch)

**Step 6 — Action + State**
- `src/sdui/ActionHandler.ts` — all action types handled
- `src/sdui/SDUIRenderer.tsx` — FlashList + ErrorBoundary per item

**Step 7 — All 6 Components**
Build one at a time:
- `src/components/HeaderComponent.tsx`
- `src/components/BannerCarouselComponent.tsx` — horizontal scroll
- `src/components/CategoryChipsComponent.tsx` — each chip has own action
- `src/components/cards/CarCard.tsx` — reusable card
- `src/components/CarCardRailComponent.tsx` — horizontal FlashList
- `src/components/ValuePropStripComponent.tsx`
- `src/components/FooterCTAComponent.tsx` — layout prop support

**Step 8 — Features (Screen.tsx + useScreen.ts pairs)**
- `src/features/home/useScreen.ts` — load JSON, handle actions, state
- `src/features/home/Screen.tsx` — renders SDUIRenderer
- `src/features/static/useScreen.ts` — static screen logic
- `src/features/static/Screen.tsx` — hardcoded version for benchmarking

**Step 9 — Navigation**
- `src/navigation/NavigationParamList.ts`
- `src/navigation/RootNavigation.ts`
- `src/navigation/Router.tsx` — Stack: Home SDUI + Static tab for benchmarking

**Step 10 — Release build + measure**
- Build release APK
- Run 5 cold opens each
- Fill PERF.md honestly

**Step 11 — Documentation**
- README.md — setup, architecture, schema rationale, versioning
- COVERAGE.md
- AI_WORKFLOW.md (fill with REAL prompts and rejections)

**Step 12 — Screen recording (3–5 mins)**
Must show all of these:
1. App loading from JSON
2. Horizontal car rail scrolling
3. Category chip tap → state update (show it working)
4. Footer CTA → bottom sheet open
5. **Unknown component fallback** — `holographic_display` in JSON renders nothing / dev warning
6. **Live JSON edit** — change a title/color in JSON → re-run → show change (no code change)
7. Folder structure walkthrough
8. 2-3 key files explained briefly

---

## Known Issues / Trade-offs to Mention in README

Be honest — Cars24 scores honesty:

1. **Visibility conditions removed** — Original plan used string eval for
   conditional visibility. Removed due to security risk (eval). 
   Alternative: server-side filtering — server simply omits sections
   the client shouldn't render.

2. **No real network layer** — JSON served from local file. In production
   this would be a versioned REST endpoint with caching, retry logic,
   and stale-while-revalidate strategy.

3. **No skeleton loading** — Defined in schema (`fallback: 'skeleton'`)
   but not fully implemented. Would use @shopify/flash-list's
   `ListEmptyComponent` and shimmer animations.

4. **SDUI overhead is real** — JSON parse + registry lookup adds ~15-25ms
   versus hardcoded. This is acceptable for the OTA update benefit.
   Reported honestly in PERF.md.

---

## Opening Prompt for Claude Code

```
I'm building a Server-Driven UI (SDUI) system for a Cars24
technical assessment. Read CLAUDE.md fully first.

Key things to confirm before we start:
1. Schema design — SDUIPage, SDUIComponent, SDUIAction, SDUILayout
2. Why ErrorBoundary instead of try/catch for render errors
3. Why visibility conditions use server-side filtering (not eval)
4. CategoryChips — each chip item has its own action, not section-level
5. The 12 build steps order

Ask any clarifications before Step 1.
```

---

## What Will Impress Cars24

1. **ErrorBoundary over try/catch** — shows React fundamentals
2. **Honest trade-offs in README** — removed eval, explained why
3. **Unknown fallback demo** — page never crashes, just skips
4. **Live JSON edit demo** — proves the SDUI concept works
5. **Honest PERF.md** — real numbers even if SDUI is slower
6. **AI_WORKFLOW.md with real rejections** — not placeholder text
7. **Clean commit history** — they read how you worked
8. **5+ car cards** — shows horizontal scroll actually works
