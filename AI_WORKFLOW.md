# AI Workflow

Built with Claude Code, working step-by-step through the 12-step plan in
`CLAUDE.md`. This log covers the decisions that weren't just "follow the
spec" — where the plan hit a real-world snag or needed a judgment call.

## Dependency conflicts caught before they became build failures

**`react-native-fast-image` doesn't support React 19.**
`CLAUDE.md` specified it directly. Running `npm install` on it threw an
`ERESOLVE` — the package's peer dep caps at React 17/18, and this project
is on React 19.2.3. Options were: force-install with `--legacy-peer-deps`
and hope it works at runtime, or find a maintained alternative.

I flagged it to the user instead of silently forcing the install (forcing
a peer-dep mismatch on an unmaintained package, this early, is the kind of
thing that costs hours later when it breaks under New Architecture). User
picked `@d11/react-native-fast-image` — a maintained fork with the same
API surface. Verified the type definitions matched (`FastImage.priority`,
`FastImage.resizeMode` static props) before writing any component code
against it, so the swap was drop-in.

**`react-native-mmkv` v4 rewrote its API — `new MMKV()` no longer exists.**
`CLAUDE.md`'s `MMKV.ts` snippet used `new MMKV({ id: ... })`. Installed
version was 4.3.2, which replaced the class constructor with a
`createMMKV()` factory as part of a move to Nitro Modules. `tsc` caught
this immediately (`'MMKV' only refers to a type`). Read the package's
`.d.ts` directly rather than guessing at the migration — found `createMMKV`
exported from the same `index.d.ts` and swapped to it.

**That same Nitro Modules move meant a missing peer dependency didn't
surface until the actual Gradle build.** TypeScript compiled fine — the
gap was native. `./gradlew assembleRelease` failed with `Project with path
':react-native-nitro-modules' could not be found`. This wouldn't have been
caught without actually running Step 10's release build; it's the kind of
failure that only shows up when you stop trusting the JS-only signal and
build for real. Installed `react-native-nitro-modules`, rebuild succeeded
(5m49s, 374 tasks, real APK on disk).

## Where I asked instead of assumed

**MMKV for a two-field UI store.** `sduiStore.ts` only holds
`selectedChipId` and `activeSheetId` — state that's fine to lose on app
restart. Installing a native module (with pod-install/autolinking risk,
before the app had been built even once) for that felt like the wrong
rung of effort for what the store actually needs. I asked rather than
silently skipping the native dependency `CLAUDE.md` called for. User chose
to install it — so `selectedChipId` persists across sessions via MMKV,
`activeSheetId` stays in-memory (a bottom sheet reopening on cold start
would be a bug, not a feature).

**Switching package managers mid-build.** User asked to switch to pnpm
after npm had already installed everything. pnpm's default symlinked
`node_modules` layout is known to break RN's autolinking and Metro's Haste
module resolution — so this wasn't just `rm -rf node_modules && pnpm i`.
Added `.npmrc` with `node-linker=hoisted` to make pnpm's layout look flat
like npm's, which RN's tooling expects, then reinstalled clean.

## What I didn't build without being asked

- Didn't wire `react-native-vector-icons` for the value-prop icons — it
  wasn't in `CLAUDE.md`'s dependency list, and adding a new native
  dependency to solve a cosmetic gap (a checkmark glyph vs. a named icon)
  wasn't worth it unprompted. Documented as a trade-off in `README.md`
  instead.
- Didn't attempt an on-device perf run by fabricating plausible-looking
  numbers. `PERF.md` states clearly that the release build is verified but
  cold-open timing hasn't been measured, because this environment has
  simulators but no physical Android device — and `CLAUDE.md`'s own
  methodology says simulator timing isn't trustworthy for this metric.
