# SDUI Coverage Analysis

## Component Registry

| Type              | Built | JSON-only? | Notes                          |
|-------------------|-------|------------|---------------------------------|
| header            | ✅    | Partial    | Layout/text driven by JSON; search bar and notification bell are non-functional placeholders (no `action` in schema for them) |
| banner_carousel   | ✅    | Yes        | Autoplay, interval, per-banner CTA + action, pagination dots |
| category_chips    | ✅    | Yes        | Each chip has its own action; selected state persisted via Zustand+MMKV |
| car_card_rail     | ✅    | Yes        | Horizontal FlashList, badges, per-card action |
| value_prop_strip  | ✅    | Partial    | Text/layout from JSON; icon renders as a fixed glyph, not the server-sent icon name (no icon library wired) |
| footer_cta        | ✅    | Yes        | Full `layout` override support (margin, borderRadius, maxWidth) |

## Honest coverage claim

Given a new Cars24 screen built from these 6 primitives plus reasonable
variations (different copy, images, ordering, counts, colors via `layout`,
new action targets) — **roughly 70–80% renders with JSON-only changes**.

Patterns that would need new client code:

- Any genuinely new component shape (video player, map, chart, biometric
  prompt) — the registry gracefully skips these via `UnknownFallbackComponent`,
  it doesn't invent them
- Custom gesture interactions (swipe-to-dismiss, drag-to-reorder)
- Icon-driven UI beyond the fixed set actually wired (no icon library —
  see README trade-offs)
- Anything requiring a native device API not already exposed

## Extension speed

Adding a new component type, based on how the existing 6 were built:

1. Define the props type in `schema.types.ts` / `types/index.ts` — ~5 min
2. Build the React Native component — ~15 min
3. Register it in `ComponentRegistry.ts` — ~1 min
4. Add a section to `MockData.ts` to exercise it — ~5 min

**~25–30 minutes** for a straightforward presentational component with one
action. Longer for anything needing new gesture handling or a new native
dependency.

## Responsive design

- Phone (375–428px): 2-column-equivalent car rail sizing, 56px header,
  36px chips
- Tablet (768px+): 3-column-equivalent car rail sizing, 72px header, 44px
  chips, footer CTA capped at 60% width and centered
- All sizing goes through `utils/Dimensions.ts` (`rs`/`rf`/`rw`/`rh`,
  `IS_TABLET`) — no component hardcodes a pixel value
- Not yet tested on a physical tablet or iPad simulator — verified by
  reading the computed dimensions logic and running on phone-size
  simulators only
