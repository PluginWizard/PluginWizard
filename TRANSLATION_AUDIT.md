# Blockly → Java Translation Audit

Audit of `src/lib/editor/blocks/` (block definitions) against `src/lib/codegen/generators/` (Java generators), with the generated Java validated against the **PluginWizard-Core** library API (`net.kalbskinder.helpers.Helpers`, v1.4.0).

## How the system works (context for the findings)

- Each generator file under `generators/java/**/*.ts` default‑exports `{ block, generator }`. The `block` string must match either a custom JSON block key or a Blockly built‑in block name.
- The generator reads fields via `block.getFieldValue('NAME')` and inputs via `JavaGenerator.valueToCode/statementToCode(block, 'NAME', …)`. Each `NAME` **must** match an `args0` entry in the block definition.
- Value blocks return `[code, Order]`; statement blocks return a `string`.
- Any Java type referenced in the output **must** be registered via `imports.add('import …;')`. The plugin template (`public/plugin/src/main/java/net/kalbskinder/plugin/UserPlugin.java`) pre‑imports only: `Helpers`, `Bukkit`, `FileConfiguration`, `List`, `ArrayList`, `CommandHelper`, `CommandManager` (+ lombok). **Everything else needs an explicit import.**

---

## Severity summary

| # | Severity | Area | Issue |
|---|----------|------|-------|
| 1 | 🟢 Fixed | function | User functions emitted **inside** `initialize()` → nested methods, never compiles |
| 2 | 🟢 Fixed | teleport | `teleport_player_location` calls undefined `teleportPlayerHelper` |
| 3 | 🟢 Ai is wrong | world | `gamerule` emits `GameRules.X` + imports `org.bukkit.GameRules` (class doesn't exist; it's `GameRule`) |
| 4 | 🟢 Ai is wrong| region | `region_events` "leave" option maps to `onRegionLeave`; Core API method is `onRegionExit` |
| 5 | 🟢 Fixed | event | `minecraft_event` never imports the event class |
| 6 | 🟢 Fixed | entity | `entity_events` never imports the event class |
| 7 | 🟢 Fixed | region | `region_settings` uses `RegionFlag` without importing it |
| 8 | 🟢 Not an issue | item/display | `drop_item` + all 10 `display.*` blocks have **no generator** |
| 9 | 🟠 High | math | `math_arithmetic` POWER emits `a ** b` (not valid Java) |
| 10 | 🟢 Fixed | math | `math_random_range` block defined but **no generator** |
| 11 | 🟢 Fixed | function/var | `getDefaultValueForType` returns `Component.empty()` for `Player`/`World`/`Entity`/`Location` |
| 12 | 🟢 Fixed | function/var | Object types (`Player`, `Entity`, `Location`, `Component`) emitted without imports |
| 13 | 🟢 Ai is wrong | title | `display_subtitle` calls `displayTitle(...)` with 6 args (API takes 5) |
| 14 | 🟢 Fixed | player | `player_game_modes` returns `GameMode.X` without importing it |
| 15 | 🟢 Fixed | entity | `get_entity`/`set_entity` build lowercase getters (`gethealth()`) → won't compile |
| 16 | 🟢 Fixed | world | `world_gamerule` coerces non‑literal boolean inputs to `false` |
| 17 | 🟢 Fixed | region | `in_region` / `region_settings` pass region name as a bare (unquoted) identifier |
| 18 | 🟢 Ai is wrong | region | `region_events` registers the region twice + references a possibly‑wrong variable |
| 19 | 🟢 Fixed | teleport | `create_location` strips quotes with fragile `substring`, breaks on `World` inputs |
| 20 | 🟢 Fixed | list | `Collections` / `Arrays` used in 5 list generators without imports |
| 21 | 🟠 High | list | `lists_create_with` builds an **immutable** `List.of(...)` + fragile input iteration |
| 22 | 🟠 High | list | `lists_getIndex` REMOVE mode returns a string from a value generator |
| 23 | 🟠 High | loop | `controls_whileUntil` UNTIL emits a `do/while` (wrong semantics) |
| 24 | 🟠 High | text | `text_changeCase` Title Case emits a lambda into `String.replaceAll` (invalid) |
| 25 | 🟠 High | text | `text_count` uses regex `split` → wrong counts / crashes on metacharacters |
| 26 | 🟠 High | math | No operator‑precedence system: nested binary expressions lose parentheses |
| — | 🟡 Medium / 🟢 Low | various | See per‑domain sections below |

---

## 1. Critical issues

### 1.1 User‑defined functions are generated inside `initialize()` → uncompilable
- **Location:** `generators/java/function/def_function.ts:16-17` + `java.ts:101` + template `UserPlugin.java:24`
- **Issue:** `def_function` pushes a full method declaration into `pluginMethods`. In `generateJava`, `pluginMethods` replaces the `// {userPluginMethods}` placeholder, which sits **inside the body of `initialize()`** (between line 23 `{` and line 28). Java forbids methods declared inside a method body, so *any* user function makes the plugin fail to compile.
- **Fix:** Move the `// {userPluginMethods}` placeholder to class scope (outside `initialize()`), e.g. after the `initialize()` method.

### 1.2 `teleport_player_location` calls an undefined helper
- **Location:** `generators/java/teleport/teleport_player_location.ts:9`
- **Issue:** Emits `teleportPlayerHelper.teleportEntity(...)`. `teleportPlayerHelper` does not exist — the helper is `Helpers.teleportHelper`. Also `player`/`location` lack a `|| 'null'` fallback, so empty inputs emit `teleportEntity(, )`.
- **Fix:** `Helpers.teleportHelper.teleportEntity(${player || 'null'}, ${location || 'null'});`

### 1.3 `gamerule` references a non‑existent class
- **Location:** `generators/java/world/gamerule.ts:8,10`
- **Issue:** Emits `GameRules.${name}` and `imports.add('import org.bukkit.GameRules;')`. The Bukkit class is **`GameRule`** (singular); `GameRules` does not exist. Both the import and the reference fail to compile. (`world_gamerule` consumes this value into `setGameRule(...)`, which expects a `GameRule`.)
- **Fix:** Import `org.bukkit.GameRule` and emit `GameRule.${name}` — and confirm the uppercased name matches a real constant (e.g. `COMMAND_BLOCK_OUTPUT`).

### 1.4 Region "leave" event uses the wrong method name
- **Location:** `region.json:39-42` (consumed in `regions/region_events.ts:8,11`)
- **Issue:** The "leave" dropdown option maps to `onRegionLeave`, but the Core API defines `onRegionEnter` / **`onRegionExit`**. Every "leave" region event references a non‑existent method.
- **Fix:** Change the JSON option value to `onRegionExit`.

### 1.5 / 1.6 Event‑handler blocks never import the event class
- **Locations:** `generators/java/events/event.ts:7-9` (block `minecraft_event`); `generators/java/entity/entity_events.ts:7,11` (block `entity_events`)
- **Issue:**
  - `minecraft_event` emits `Helpers.eventHelper.subscribe(${eventClass}, event -> {…})` where `eventClass` is e.g. `PlayerJoinEvent.class`. No `imports.add(...)` anywhere.
  - `entity_events` emits `Helpers.eventHelper.forEntity("${id}").on(${eventType}.class, ${eventType}::getEntity, event -> {…})` and likewise imports nothing (it doesn't even import `imports`).
  - The dropdown event types live across several packages (`org.bukkit.event.player.*`, `org.bukkit.event.block.*`, `org.bukkit.event.entity.*`, plus Paper's `io.papermc.paper.event.player.AsyncChatEvent`), so a single wildcard won't cover them.
- **Fix:** Add a `{ eventName → fully‑qualified import }` lookup table and `imports.add(...)` the selected event in each generator.

### 1.7 `region_settings` uses `RegionFlag` without importing it
- **Location:** `generators/java/regions/region_settings.ts:11,13`
- **Issue:** Emits `RegionFlag.${setting}` but the file never imports `imports`, let alone `RegionFlag`. Won't compile.
- **Fix:** Import `imports` and add `imports.add('import net.kalbskinder.plugin.helpers.regions.RegionFlag;')` (match the real package, cf. `region_create` which imports `…helpers.regions.Region`).

### 1.8 Blocks defined with no generator (silently produce nothing / throw)
- **Locations:** `item.json:127` (`drop_item`); `display.json` (all 10 blocks); `math.json:2` (`math_random_range`)
- **Issue:** Generators are auto‑loaded via `import.meta.glob('./java/**/*.ts')`. These JSON blocks have **no** matching generator file:
  - `drop_item` — no `item/drop_item.ts`.
  - **All display blocks** — there is no `generators/java/display/` directory at all: `create_display_entity`, `set_display_position`, `set_display_rotation`, `set_display_scale`, `set_display_entity_model`, `set_display_item`, `set_display_text`, `set_display_visibility`, `on_click_display`, `delete_display_entity`.
  - `math_random_range` (the custom block FROM/TO) — only `math_random_int` (a Blockly built‑in) has a generator.
- **Note:** Commit `f1483d9` removed display blocks from the toolbox, but the JSON definitions remain and are still loaded by `CustomBlocks.ts`.
- **Fix:** Implement the missing generators or remove the orphan block definitions.

---

## 2. Item / Entity / Display

### `create_item` never sets a display name; `ITEM_NAME` is actually a material
- **Severity:** Medium · **Location:** `item/create_item.ts:30-35` (block `item.json:14`)
- **Issue:** The field is named `ITEM_NAME` but is parsed as a material (`minecraft:diamond` → `Material.DIAMOND`); `.name(...)` is never called, so items created via this block can never have a custom name. Field name is misleading.
- **Fix:** Rename the field to `MATERIAL`, or add a separate material field and route `ITEM_NAME` through `.name("...")`.

### Empty/invalid material parsing yields `Material.`
- **Severity:** Low · **Location:** `item/create_item.ts:31`, `item/string_to_item.ts:8`
- **Issue:** `itemString.substring(itemString.indexOf(':') + 1).toUpperCase()`. A blank field emits `Material.` (uncompilable). No validation/fallback.
- **Fix:** Guard empty input with a default (e.g. `STONE`) or skip `.material()` when blank.

### `give_item` / `give_item_slot` add an unused `Material` import; `SLOT` defaults to `null`
- **Severity:** Medium · **Location:** `item/give_item.ts:13`, `item/give_item_slot.ts:7,14`
- **Issue:** Both add `import org.bukkit.Material;` although the output (`Helpers.playerItemHelper.giveItem/setItem`) never references `Material`. In `give_item_slot`, `SLOT` defaults to `'null'`; `setItem(item, int slot, …)` needs an `int`, so an empty slot input emits `null` and won't compile.
- **Fix:** Remove the dead `Material` import; default `SLOT` to `'0'`. (Arg order `setItem(item, slot, amount, receiver)` matches the API — correct.)

### `get_entity` / `set_entity` generate lowercase bean methods
- **Severity:** High · **Location:** `entity/get_entity.ts:10`, `entity/set_entity.ts:11`
- **Issue:** Emits `entity.get${property}()` / `set${property}(...)` with the raw dropdown value, producing `gethealth()`, `setmaxHealth(...)`, `setdisplayName(...)`. Java requires `getHealth()`, `setMaxHealth()`, `setDisplayName()` — none compile. Several properties also have no such method (`alwaysShowName` → `setCustomNameVisible`, `maxHealth` → attribute API, `pose` → `setPose`).
- **Fix:** Capitalize the first letter at minimum; better, map each dropdown value to its real Bukkit method (or a `Helpers` method).

### `create_entity` `WORLD` input has no null fallback
- **Severity:** Medium · **Location:** `entity/create_entity.ts` (`WORLD` valueToCode)
- **Issue:** Unlike sibling generators, `WORLD` is read without `|| 'null'`, so an unconnected input emits a trailing‑comma syntax error.
- **Fix:** Add `|| 'null'`.

### Entity variable‑name coupling is unsanitized
- **Severity:** Medium · **Location:** `entity/create_entity.ts`, `set_entity.ts`, `get_entity.ts`, `teleport_entity.ts`
- **Issue:** The free‑text `ID` field is interpolated into a Java variable name (`customEntity${id}`) and re‑used across blocks via a shared `|| '1'` fallback. Non‑identifier characters (spaces, dashes, `:`) produce invalid Java, and any casing/character mismatch between the create block and a set/get block references an undeclared variable.
- **Fix:** Sanitize `id` to `[A-Za-z0-9_]` consistently across all four generators.

*No field‑id mismatches or orphan generators found in item/entity.*

---

## 3. World / Region / Teleport

(See §1.3 `gamerule`, §1.4/§1.7 region, §1.2 teleport.)

### `world_gamerule` discards non‑literal boolean values
- **Severity:** High · **Location:** `world/world_gamerule.ts:9-11`
- **Issue:** Compares the *generated code string* with `value === 'true'`; any non‑literal boolean (variable, method call) fails the check and is forced to `'false'`, silently dropping the user's value.
- **Fix:** Emit the boolean expression directly: `world.setGameRule(${gamerule}, ${value})`.

### `in_region` / `region_settings` pass the region name unquoted
- **Severity:** High · **Location:** `regions/in_region.ts:7,10`; `regions/region_settings.ts:6,11,13`
- **Issue:** `REGION` is a `field_input` (text). The name is interpolated unquoted, producing `isPlayerInRegion(player, my_region)` / `addRegionFlag(my_region, …)` — references an undefined Java variable.
- **Fix:** Quote it (`"${regionName}"`) or resolve the region object via the helper by name; match the actual helper signatures.

### `region_events` double‑registers and references a possibly‑wrong variable
- **Severity:** High · **Location:** `regions/region_events.ts:11`
- **Issue:** Pushes `${regionName}.${eventType}(...)` **plus** `Helpers.regionHelper.addRegion(${regionName})`. But `region_create` (`region_create.ts:16`) *already* calls `addRegion` → the region is registered twice. Worse, `region_events` reads the name from a separate `REGION` text field (default `my_region`) while `region_create` declares the variable from its `REGION_NAME` field — the two need not match, so `${regionName}.onRegionEnter` may reference an undeclared variable.
- **Fix:** Drop the redundant `addRegion`; resolve the region via the helper by name (e.g. `Helpers.regionHelper.getRegion("${name}").onRegionExit(...)`) rather than depending on a same‑named local.

### `create_location` strips quotes with a fragile `substring`
- **Severity:** High · **Location:** `teleport/create_location.ts:11`
- **Issue:** `world.substring(1, world.length - 1)` assumes `WORLD` is always a quoted string literal. The block accepts `["World","String"]`, so a connected `get_world` block emits `Bukkit.getWorld("world")` — slicing the first/last char yields garbage; an empty input (`'null'`) slices to `ul`.
- **Fix:** Don't slice. Handle the `World`‑object vs `String`‑name cases explicitly, building `new Location(world, x, y, z)` (import `org.bukkit.Location`) or `Helpers.locationHelper.stringToLocation(...)`.

### `spawn_particle` dead fallback enum may be outdated
- **Severity:** Low · **Location:** `world/spawn_particle.ts:8`
- **Issue:** Fallback `'EXPLOSION_NORMAL'` was renamed in modern Paper (`POOF`/`EXPLOSION`). Only reached on empty input, so low impact.

### `region_create` region name has no fallback / used as identifier
- **Severity:** Low · **Location:** `regions/region_create.ts:7,16`
- **Issue:** `REGION_NAME` read with no default and used as both the Java variable name and the region's string name — non‑identifier characters break compilation.
- **Fix:** Sanitize the variable name; default the field.

*No missing/orphan generators in world/region/teleport otherwise.*

---

## 4. Player / Title / Message / Sound

### `display_subtitle` calls `displayTitle` with the wrong signature
- **Severity:** High · **Location:** `title/display_subtitle.ts:13`
- **Issue:** Emits `Helpers.titleHelper.displayTitle(${target}, "", ${text}, ${fadeIn}, ${stay}, ${fadeOut})` — 6 args. The documented API is `displayTitle(sender, text, fadeIn, stay, fadeOut)` (5 args). No 6‑arg overload is documented.
- **Fix:** Use the dedicated subtitle entry point (e.g. `displaySubtitle(target, text, fadeIn, stay, fadeOut)`) — verify the exact method name against the library.

### `player_game_modes` returns `GameMode.X` without importing it
- **Severity:** High · **Location:** `player/player_game_modes.ts:8`
- **Issue:** Output references `GameMode.SURVIVAL` etc.; `GameMode` is not pre‑imported and no `imports.add(...)` is present.
- **Fix:** `imports.add('import org.bukkit.GameMode;')`.

### `chat_message` returns unparsed MiniMessage despite `Component` output
- **Severity:** Medium · **Location:** `message/chat_message.ts:9`
- **Issue:** Builds `"<color:#rrggbb>" + message` (a raw `String`) but the block's `output` is `["Component","String"]`. Nothing converts it to a `Component`; consumers that treat it as a literal string will show the `<color:…>` tags verbatim. Works only if every consumer calls `miniMessageHelper.parse(...)` (as `broadcast_message` does).
- **Fix:** Wrap in `Helpers.miniMessageHelper.parse(...)` here, or document that the value is always parsed downstream.

### `display_actionbar` — verify helper method exists
- **Severity:** Low (informational) · **Location:** `title/display_actionbar.ts`
- **Note:** Block `display_actionbar` **does** exist in `title.json` (not an orphan). The generator calls `Helpers.titleHelper.displayActionbar(...)` — confirm that method exists in the library (only `displayTitle` is documented in the README).

*All player/title/message/sound field ids match; `play_sound`/`play_sound_at` correctly import `org.bukkit.Sound`. No missing generators.*

---

## 5. Config / Function / Variable / Command

(See §1.1 nested functions.)

### `getDefaultValueForType` returns `Component.empty()` for object types
- **Severity:** High · **Location:** `java.ts:118-122`
- **Issue:** `Player`, `World`, `Entity`, `Location` all fall through to `return 'Component.empty()'`. A non‑void function returning one of these with no explicit `return` (`def_function.ts:12-14`) generates `return Component.empty();` → type mismatch. Same wrong default backs `variables_declare.ts:9`.
- **Fix:** Return `null` for `Player`/`World`/`Entity`/`Location`; only `Component` should map to `Component.empty()`.

### Object types emitted without imports
- **Severity:** High · **Location:** `function/def_function.ts:16`, `variable/variables_declare.ts:10`, `java.ts:122`
- **Issue:** `def_function` (`RET_TYPE`) and `variables_declare` (`TYPE`) can emit `Player`, `Entity`, `Location`, `Component` (and `List<Player>` etc.) with no import; `getDefaultValueForType` can emit `Component.empty()` without importing `net.kyori.adventure.text.Component`.
- **Fix:** Inspect the chosen type and `imports.add(...)` the matching FQN (`org.bukkit.entity.Player`, `org.bukkit.entity.Entity`, `org.bukkit.Location`, `net.kyori.adventure.text.Component`).

### Multiple subcommands produce `..` (double dot) in the command chain
- **Severity:** Medium · **Location:** `events/sub_command.ts`, joined in `events/new_command.ts:13`
- **Issue:** Sub‑command fragments already begin with `.sub(...)`. `new_command` joins SUBS via `.split('|').join('.')`, inserting a `.` between fragments → `…end()..sub(...)` for 2+ subcommands (syntax error). Single subcommand happens to work.
- **Fix:** Join sub fragments with `''` (they carry their own leading `.`), or strip leading dots before joining.

### Inconsistent indentation across command branches
- **Severity:** Medium · **Location:** `events/new_command.ts:28,32` vs `36,40`
- **Issue:** `commandOnly`/`commandWithArgs` use `indent(..., 4)`; the sub‑command branches use bare `indent(...)` (defaults to 2). Cosmetic only.
- **Fix:** Pass `4` explicitly in all branches.

### `command_sender_get` output typed `Player` but returns `CommandSender`
- **Severity:** Low · **Location:** `command.json:221`, `events/command_sender_get.ts:7`
- **Issue:** `ctx.getSender()` returns `CommandSender`; the block declares `output: "Player"`. Downstream `Player` usage may need a cast (the tooltip implies a player‑only context).
- **Fix:** Emit `(Player) ctx.getSender()` (and import `Player`), or change the output type.

*All config/function/variable/command field ids match; collection routing (`configYamlLines`, `pluginMethods`, `pluginCommands`) is otherwise correct. No missing generators.*

---

## 6. Event / Text

(See §1.5 `minecraft_event` imports.)

### `text_changeCase` Title Case emits invalid Java
- **Severity:** High · **Location:** `text/text_changeCase.ts:18-21`
- **Issue:** `${text}.replaceAll("…", m -> …)` — `String.replaceAll(String, String)` takes a replacement *string*, not a lambda. No such overload exists. Title Case never compiles.
- **Fix:** Use `Pattern`/`Matcher.replaceAll(Function<MatchResult,String>)` (import `java.util.regex.*`) or a `Helpers` utility.

### `text_count` uses regex `split` → wrong / crashing
- **Severity:** High · **Location:** `text/text_count.ts:9`
- **Issue:** `${text}.split(${sub}).length - 1`. `split` takes a **regex**, so substrings like `.` or `$` give garbage or throw `PatternSyntaxException`; trailing matches are also dropped, miscounting.
- **Fix:** Literal count, e.g. `(text.length() - text.replace(sub,"").length()) / sub.length()` (guard empty needle) or a `Helpers` method.

### `text_getSubstring` dead branches; `FIRST` works by accident
- **Severity:** Low · **Location:** `text/text_getSubstring.ts:19-24,38-46`
- **Issue:** WHERE1 has no `LAST` option, so the `where1 === 'LAST'` guard is dead; `FIRST` has no branch and falls into the `else → '0'` fallback (correct by accident). The `at1 === null` branches are unreachable.
- **Fix:** Add an explicit `FIRST → '0'` case and remove the dead code.

### `text_join` breaks with zero items
- **Severity:** Low · **Location:** `text/text_join.ts:7-11`
- **Issue:** Iterates `inputList.length` reading `ADD0..ADDn`. With 0 items Blockly creates a single `EMPTY` input, so the loop reads a non‑existent `ADD0` → `String.join("", )` (invalid).
- **Fix:** Iterate only inputs whose name starts with `ADD` (or read the mutator count); short‑circuit to `""` when empty.

*All text/event field ids match; the `text_*` generators correctly extend Blockly built‑ins.*

---

## 7. Math / Logic / Loop / List

(See §1.8 `math_random_range` missing generator.)

### No operator‑precedence system (systemic)
- **Severity:** High · **Location:** `java.ts:133-135` + every binary value generator
- **Issue:** `Order = { ATOMIC: 0 }` only. Every generator requests and returns `Order.ATOMIC` (the strongest), so Blockly **never** inserts protective parentheses. Bare binary expressions corrupt precedence when nested:
  - `math_arithmetic.ts:18` — `multiply(add(1,2),3)` → `1 + 2 * 3` = 7, not 9.
  - `math_modulo.ts:9`, `math_number_property` (`DIVISIBLE_BY`, `WHOLE`), `logic_compare.ts:19`, `logic_operation.ts:10` (`a && b || c`), `logic_negate.ts:8` (`!a == b`), `math_single` NEG.
- **Fix:** Introduce a real precedence ladder (ADDITIVE / MULTIPLICATIVE / RELATIONAL / EQUALITY / LOGICAL_AND / LOGICAL_OR / UNARY …), request the correct inner order, and return each expression's true order. Minimum stop‑gap: wrap emitted binary expressions in parentheses.

### `math_arithmetic` POWER emits `**`
- **Severity:** High · **Location:** `math/math_arithmetic.ts:12,18`
- **Issue:** `POWER: '**'` → `a ** b`, which is not a Java operator (compile error).
- **Fix:** Special‑case POWER → `Math.pow(left, right)`.

### `controls_whileUntil` UNTIL generates a `do/while`
- **Severity:** High · **Location:** `loop/controls_whileUntil.ts:15`
- **Issue:** UNTIL emits `do {…} while (!cond);`. Blockly's UNTIL is a *pre‑test* loop (`while (!cond) {…}`, may run zero times); `do/while` always runs once.
- **Fix:** `while (!(${cond})) { … }`.

### `Collections` / `Arrays` used without imports
- **Severity:** High · **Location:** `list/lists_reverse.ts:8`, `lists_sort.ts:8-9`, `lists_shuffle.ts:8`, `lists_repeat.ts:9` (`Collections`); `list/lists_split.ts:12` (`Arrays`)
- **Issue:** Neither `java.util.Collections` nor `java.util.Arrays` is pre‑imported and no generator adds them.
- **Fix:** `imports.add('import java.util.Collections;')` / `'import java.util.Arrays;'` in the relevant files.

### `lists_create_with` builds an immutable list + fragile iteration
- **Severity:** High · **Location:** `list/lists_create_with.ts:8-12`
- **Issue:** `List.of(...)` is **immutable** — any later `lists_setIndex`/`sort`/`reverse`/`shuffle` throws `UnsupportedOperationException`. Also iterates `inputList.length` (couples ADD index to raw input‑array length; empty list reads a non‑existent `ADD0`).
- **Fix:** Use `new ArrayList<>(Arrays.asList(...))` (import `Arrays`); derive count from `block.itemCount_` or filter inputs named `ADD*`.

### `lists_getIndex` REMOVE mode returns a string from a value generator
- **Severity:** High · **Location:** `list/lists_getIndex.ts:14-19`
- **Issue:** `lists_getIndex` is a value block (must return `[code, Order]`), but the `REMOVE` branch returns a bare string. Blockly will destructure the string, taking only its first character.
- **Fix:** Distinguish statement vs value via `block.outputConnection`; return a `string` for the statement form and `[code, Order]` for the value form.

### `lists_setIndex` can emit `undefined`
- **Severity:** Medium · **Location:** `list/lists_setIndex.ts:36-42`
- **Issue:** If `mode` is neither `SET` nor `INSERT`, `code` stays `undefined` → output `"undefined\n"`.
- **Fix:** Initialize `let code = ''` or throw on unknown mode.

### `lists_sort` ignores `TYPE`; `lists_getSublist` ignores `WHERE1`/`WHERE2`
- **Severity:** Medium · **Location:** `list/lists_sort.ts:8-9`, `list/lists_getSublist.ts:10`
- **Issue:** `lists_sort` reads only `DIRECTION`, dropping `TYPE` (NUMERIC/TEXT/IGNORE_CASE). `lists_getSublist` hard‑codes `subList(at1-1, at2)`, valid only when both ends are FROM_START — "from end"/"last" give wrong indices.
- **Fix:** Read `TYPE` and build the right `Comparator`; read `WHERE1`/`WHERE2` and compute each endpoint (`size() - at` for FROM_END).

### `controls_repeat_ext` hard‑codes counter `i`; `controls_for` ignores `BY`
- **Severity:** Medium · **Location:** `loop/controls_repeat_ext.ts:9`, `loop/controls_for.ts:12-16`
- **Issue:** `controls_repeat_ext` always uses `int i` (clashes with user vars / nesting). `controls_for` reads only `FROM`/`TO`, hard‑codes `++` and `<=` — the `BY` step is silently ignored and descending ranges never run / never terminate.
- **Fix:** Generate a distinct counter via `nameDB_.getDistinctName(...)`; read `BY` and choose the comparison direction.

### `math_number_property` WHOLE excludes negatives
- **Severity:** Low · **Location:** `math/math_number_property.ts:21-23`
- **Issue:** `number >= 0 && Math.floor(number) == number` — `-3` is whole but reports `false`. Also evaluates `number` twice.
- **Fix:** Drop the `>= 0` clause.

### `controls_if` reads private mutator fields
- **Severity:** Low · **Location:** `logic/controls_if.ts:15,23`
- **Issue:** Relies on `block.elseifCount_` / `elseCount_` (internal Blockly fields). Works today but fragile; output uses `}\nelse if` (compiles, minor style).
- **Fix (optional):** Probe `getInput('IF'+i)` until null.

### `lists_indexOf` (verified correct)
- `indexOf(...) + 1` maps Java's `-1` (not found) to `0`, matching Blockly's 1‑based "0 = not found" convention. No bug.

*Other math/logic/loop/list generators read the correct built‑in field ids (`math_constrain`, `math_single`, `math_trig`, `math_round`, `math_modulo`, `math_random_int`, `math_on_list`, `logic_*`, `controls_forEach`, `controls_flow_statements`, `lists_length`/`isEmpty`/`repeat`) and map operators correctly.*

---

## Recommended fix order

1. **Compilation blockers that affect every plugin using the feature** — §1.1 (functions), §1.3 (gamerule), §1.5/§1.6 (event imports), §1.7 (RegionFlag), §1.2 (teleport helper).
2. **Missing generators** — §1.8 (`drop_item`, `display.*`, `math_random_range`): implement or remove from toolbox.
3. **Wrong output / silent data loss** — §1.4 (`onRegionExit`), entity getters (§2), `display_subtitle` (§4), `world_gamerule` boolean (§3), `getDefaultValueForType` + object imports (§5), `math_arithmetic` POWER, `controls_whileUntil`, list `Collections`/`Arrays` imports & immutability (§7).
4. **Systemic** — introduce a real `Order` precedence ladder (§7); add a shared identifier‑sanitizer for interpolated variable names (entity IDs, region names).
