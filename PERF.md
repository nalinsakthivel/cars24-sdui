# Performance Comparison

Device: [fill in — your device model, Android version]
Build: Release APK
Runs: 5 cold opens each, averaged

## How to measure

```bash
cd android && ./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

Then for each of the 5 runs, per screen (SDUI and Static):
1. Force-stop the app: `adb shell am force-stop com.cars24_sdui`
2. Launch it and let it settle
3. Read the `perf.ts` markers (logged via `console.log(perf.report())` —
   wire a temporary log call in `Screen.tsx` if not already visible, or
   pull frame drops from Android Profiler / `adb shell dumpsys gfxinfo`)
4. Record TTR/TTI/full-page ms below, then average across the 5 runs

`perf.ts` markers are already wired: `app_start` (index.js), `fetch_start`/
`parse_complete` (GetApiServices.ts), `render_start`/`render_complete`/
`above_fold_visible`/`interactive` (features/home/Screen.tsx).

| Metric         | Static    | SDUI      | Overhead |
|----------------|-----------|-----------|----------|
| TTR            | ___ms     | ___ms     | ___%     |
| TTI            | ___ms     | ___ms     | ___%     |
| Full page      | ___ms     | ___ms     | ___%     |
| JSON parse     | N/A       | ___ms     | -        |
| View build     | ___ms     | ___ms     | -        |
| Dropped frames | ___       | ___       | -        |

Optimizations attempted:
1. FlashList for both the section list and car rail — avoids full-window
   rendering on scroll
2. `useMemo` on `resolveComponent` in `SDUIRenderer` — avoids a registry
   lookup on every re-render
3. `@d11/react-native-fast-image` for car/banner images — shared image
   cache so scrolling back up the rail doesn't re-download

What worked: [fill in after real measurement]
What didn't: [fill in after real measurement]

---

**Not yet measured** — this environment has iOS simulators but no physical
Android device attached, and cold-open timing on a simulator isn't
representative (no real CPU/memory throttling). Run the steps above on a
physical device to fill in real numbers.
