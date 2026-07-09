# Blockly → Java Translation Audit — Remaining Issues

Audit of `src/lib/editor/blocks/` (block definitions) against `src/lib/codegen/generators/` (Java generators), with the generated Java validated against the **PluginWizard-Core** library API (`net.kalbskinder.helpers.Helpers`, v1.4.0).

> This file has been trimmed to **only the issues that are still open**. Everything that has been fixed (nested user functions, teleport helper, event/RegionFlag/GameMode imports, region name quoting, `world_gamerule` boolean, `create_location` slicing, `math ** → Math.pow`, the `Order` precedence ladder, `while`/UNTIL semantics, list `Collections`/`Arrays` imports + immutability, `lists_getIndex` REMOVE, `text_count`, `text_changeCase` Title Case, object-type defaults/imports, sub-command `.` joining) or dismissed as not-an-issue has been removed.

## How the system works (context for the findings)

- Each generator file under `generators/java/**/*.ts` default‑exports `{ block, generator }`. The `block` string must match either a custom JSON block key or a Blockly built‑in block name.
- The generator reads fields via `block.getFieldValue('NAME')` and inputs via `JavaGenerator.valueToCode/statementToCode(block, 'NAME', …)`. Each `NAME` **must** match an `args0` entry in the block definition.
- Value blocks return `[code, Order]`; statement blocks return a `string`.
- Any Java type referenced in the output **must** be registered via `imports.add('import …;')`. The plugin template (`public/plugin/src/main/java/net/kalbskinder/plugin/UserPlugin.java`) pre‑imports only: `Helpers`, `Bukkit`, `FileConfiguration`, `List`, `ArrayList`, `CommandHelper`, `CommandManager` (+ lombok). **Everything else needs an explicit import.**

---

## Remaining issue summary

| # | Severity | Area | Issue |
|---|----------|------|-------|
| 8 | 🟡 Low | world | `spawn_particle` fallback enum `EXPLOSION_NORMAL` may be outdated |
| 9 | 🟡 Low | region | `region_create` region name has no fallback / used as identifier unsanitized |
| 10 | 🟠 Medium | message | `chat_message` returns unparsed MiniMessage `String` despite `Component` output |
| 11 | 🟡 Low (info) | title | `display_actionbar` — confirm `displayActionbar(...)` exists in the library |
| 12 | 🟠 Medium | command | Multiple subcommands produce `..` (double dot) in the command chain |
| 13 | 🟠 Medium | command | Inconsistent indentation across `new_command` branches (cosmetic) |
| 14 | 🟡 Low | command | `command_sender_get` output typed `Player` but returns `CommandSender` |
| 15 | 🟡 Low | text | `text_getSubstring` has dead/unreachable branches |
| 16 | 🟡 Low | text | `text_join` breaks with zero items (reads non‑existent `ADD0`) |
| 17 | 🟠 Medium | list | `lists_setIndex` can emit `undefined` for an unknown mode |
| 18 | 🟠 Medium | list | `lists_sort` ignores `TYPE`; `lists_getSublist` ignores `WHERE1`/`WHERE2` |
| 19 | 🟠 Medium | loop | `controls_repeat_ext` hard‑codes counter `i`; `controls_for` ignores `BY` |
| 20 | 🟡 Low | math | `math_number_property` WHOLE excludes negatives |
| 21 | 🟡 Low | logic | `controls_if` reads private mutator fields (`elseifCount_`/`elseCount_`) |

*Orphan note:* `item.json` still defines `drop_item` with **no** matching generator (`item/drop_item.ts` does not exist). The `display.*` blocks and `math_random_range` block are gone, so those are resolved.

---

## 1. World / Region / Teleport

### `gamerule` references a non‑existent class
- **Severity:** 🔴 High · **Location:** `generators/java/world/gamerule.ts:8,10`
- **Issue:** Still emits `GameRules.${name}` and `imports.add('import org.bukkit.GameRules;')`. The Bukkit class is **`GameRule`** (singular); `org.bukkit.GameRules` does not exist, so both the import and the reference fail to compile. `world_gamerule` consumes this value into `setGameRule(...)`, which expects a `GameRule`.
- **Fix:** Import `org.bukkit.GameRule` and emit `GameRule.${name}` — and confirm the uppercased name matches a real constant (e.g. `COMMAND_BLOCK_OUTPUT`).
- **Note:** This was previously annotated "Ai is wrong", but the current code is still in the broken state. Worth re‑confirming against the actual library.

### `spawn_particle` dead fallback enum may be outdated
- **Severity:** 🟡 Low · **Location:** `world/spawn_particle.ts:8`
- **Issue:** Fallback `'EXPLOSION_NORMAL'` was renamed in modern Paper (`POOF`/`EXPLOSION`). Only reached on empty input, so low impact.

### `region_create` region name has no fallback / used as identifier
- **Severity:** 🟡 Low · **Location:** `regions/region_create.ts:7,16`
- **Issue:** `REGION_NAME` read with no default and used as both the Java variable name and the region's string name — non‑identifier characters break compilation.
- **Fix:** Sanitize the variable name; default the field.

---

## 2. Item / Entity

### `create_item` never sets a display name; `ITEM_NAME` is actually a material
- **Severity:** 🟠 Medium · **Location:** `item/create_item.ts:30-35` (block `item.json:14`)
- **Issue:** The field is named `ITEM_NAME` but is parsed as a material (`minecraft:diamond` → `Material.DIAMOND`); `.name(...)` is never called, so items created via this block can never have a custom name. Field name is misleading.
- **Fix:** Rename the field to `MATERIAL`, or add a separate material field and route `ITEM_NAME` through `.name("...")`.

### Empty/invalid material parsing yields `Material.`
- **Severity:** 🟡 Low · **Location:** `item/create_item.ts:31`, `item/string_to_item.ts:8`
- **Issue:** `itemString.substring(itemString.indexOf(':') + 1).toUpperCase()`. A blank field emits `Material.` (uncompilable). No validation/fallback.
- **Fix:** Guard empty input with a default (e.g. `STONE`) or skip `.material()` when blank.

### `give_item` / `give_item_slot` add an unused `Material` import; `SLOT` defaults to `null`
- **Severity:** 🟠 Medium · **Location:** `item/give_item.ts:13`, `item/give_item_slot.ts:7,14`
- **Issue:** Both add `import org.bukkit.Material;` although the output (`Helpers.playerItemHelper.giveItem/setItem`) never references `Material`. In `give_item_slot`, `SLOT` defaults to `'null'`; `setItem(item, int slot, …)` needs an `int`, so an empty slot input emits `null` and won't compile.
- **Fix:** Remove the dead `Material` import; default `SLOT` to `'0'`. (Arg order `setItem(item, slot, amount, receiver)` matches the API — correct.)

### `get_entity` / `set_entity` map some properties to non‑existent Bukkit methods
- **Severity:** 🟠 Medium · **Location:** `entity/get_entity.ts:10`, `entity/set_entity.ts:11`
- **Issue:** The dropdown values are now correctly capitalized (`Health`, `MaxHealth`, `DisplayName`, …), so `get${property}()` / `set${property}(...)` produce valid method *casing* — the earlier lowercase‑getter bug is fixed. However, several properties still have no such Bukkit method: `AlwaysShowName` → should be `setCustomNameVisible`; `MaxHealth` → attribute API (`getAttribute(Attribute.GENERIC_MAX_HEALTH)`); `Pose` → `setPose` exists but only via Paper.
- **Fix:** Map each dropdown value to its real Bukkit method (or a `Helpers` method) rather than blindly prefixing `get`/`set`.

### `create_entity` `WORLD` input has no null fallback
- **Severity:** 🟠 Medium · **Location:** `entity/create_entity.ts` (`WORLD` valueToCode)
- **Issue:** Unlike sibling generators, `WORLD` is read without `|| 'null'`, so an unconnected input emits a trailing‑comma syntax error.
- **Fix:** Add `|| 'null'`.

### Entity variable‑name coupling is unsanitized
- **Severity:** 🟠 Medium · **Location:** `entity/create_entity.ts`, `set_entity.ts`, `get_entity.ts`, `teleport_entity.ts`
- **Issue:** The free‑text `ID` field is interpolated into a Java variable name (`customEntity${id}`) and re‑used across blocks via a shared `|| '1'` fallback. Non‑identifier characters (spaces, dashes, `:`) produce invalid Java, and any casing/character mismatch between the create block and a set/get block references an undeclared variable.
- **Fix:** Sanitize `id` to `[A-Za-z0-9_]` consistently across all four generators.

---

## 3. Message / Title

### `chat_message` returns unparsed MiniMessage despite `Component` output
- **Severity:** 🟠 Medium · **Location:** `message/chat_message.ts:9`
- **Issue:** Builds `"<color:#rrggbb>" + message` (a raw `String`) but the block's `output` is `["Component","String"]`. Nothing converts it to a `Component`; consumers that treat it as a literal string will show the `<color:…>` tags verbatim. Works only if every consumer calls `miniMessageHelper.parse(...)` (as `broadcast_message` does).
- **Fix:** Wrap in `Helpers.miniMessageHelper.parse(...)` here, or document that the value is always parsed downstream.

### `display_actionbar` — verify helper method exists
- **Severity:** 🟡 Low (informational) · **Location:** `title/display_actionbar.ts`
- **Note:** The generator calls `Helpers.titleHelper.displayActionbar(target, text)` — confirm that method exists in the library (only `displayTitle` is documented in the README).

---

## 4. Command

### Multiple subcommands produce `..` (double dot) in the command chain
- **Severity:** 🟠 Medium · **Location:** `events/sub_command.ts:21,25`, joined in `events/new_command.ts:13`
- **Issue:** Each sub‑command fragment already ends with `.end()` and begins with `.sub(...)`. `new_command` splits `SUBS` on `|`, filters, and re‑joins with `'.'`, so between two fragments it inserts a dot: `…end()` + `.` + `.sub(…)` → `…end()..sub(…)` (syntax error) for 2+ subcommands. A single subcommand happens to work.
- **Fix:** Join sub fragments with `''` (they carry their own leading `.`), or strip leading dots before joining.

### Inconsistent indentation across command branches
- **Severity:** 🟠 Medium · **Location:** `events/new_command.ts:36,40` vs `28,32`
- **Issue:** `commandOnly`/`commandWithArgs` use `indent(..., 4)`; the sub‑command branches (`commandWithSubs`/`commandWithArgsAndSubs`) use bare `indent(...)` (defaults to 2). Cosmetic only.
- **Fix:** Pass `4` explicitly in all branches.

### `command_sender_get` output typed `Player` but returns `CommandSender`
- **Severity:** 🟡 Low · **Location:** `command.json:221`, `events/command_sender_get.ts:7`
- **Issue:** `ctx.getSender()` returns `CommandSender`; the block declares `output: "Player"`. Downstream `Player` usage may need a cast (the tooltip implies a player‑only context).
- **Fix:** Emit `(Player) ctx.getSender()` (and import `Player`), or change the output type.

---

## 5. Text

### `text_getSubstring` dead branches; `FIRST` works by accident
- **Severity:** 🟡 Low · **Location:** `text/text_getSubstring.ts:19-24,38-46`
- **Issue:** WHERE1 has no `LAST` option, so the `where1 === 'LAST'` guard is dead; `FIRST` has no branch and falls into the `else → '0'` fallback (correct by accident). The `at1 === null` branches are unreachable.
- **Fix:** Add an explicit `FIRST → '0'` case and remove the dead code.

### `text_join` breaks with zero items
- **Severity:** 🟡 Low · **Location:** `text/text_join.ts:7-11`
- **Issue:** Iterates `inputList.length` reading `ADD0..ADDn`. With 0 items Blockly creates a single `EMPTY` input, so the loop reads a non‑existent `ADD0` → `String.join("", )` (invalid).
- **Fix:** Iterate only inputs whose name starts with `ADD` (or read the mutator count); short‑circuit to `""` when empty.

---

## 6. List / Loop / Math / Logic

### `lists_setIndex` can emit `undefined`
- **Severity:** 🟠 Medium · **Location:** `list/lists_setIndex.ts:36-42`
- **Issue:** `let code;` is only assigned for `SET`/`INSERT`; if `mode` is neither, `code` stays `undefined` → output `"undefined\n"`.
- **Fix:** Initialize `let code = ''` or throw on unknown mode.

### `lists_sort` ignores `TYPE`; `lists_getSublist` ignores `WHERE1`/`WHERE2`
- **Severity:** 🟠 Medium · **Location:** `list/lists_sort.ts`, `list/lists_getSublist.ts:10`
- **Issue:** `lists_sort` reads only `DIRECTION`, dropping `TYPE` (NUMERIC/TEXT/IGNORE_CASE). `lists_getSublist` hard‑codes `subList(at1-1, at2)`, valid only when both ends are FROM_START — "from end"/"last" give wrong indices.
- **Fix:** Read `TYPE` and build the right `Comparator`; read `WHERE1`/`WHERE2` and compute each endpoint (`size() - at` for FROM_END).

### `controls_repeat_ext` hard‑codes counter `i`; `controls_for` ignores `BY`
- **Severity:** 🟠 Medium · **Location:** `loop/controls_repeat_ext.ts:9`, `loop/controls_for.ts:12-16`
- **Issue:** `controls_repeat_ext` always uses `int i` (clashes with user vars / nesting). `controls_for` reads only `FROM`/`TO`, hard‑codes `++` and `<=` — the `BY` step is silently ignored and descending ranges never run / never terminate.
- **Fix:** Generate a distinct counter via `nameDB_.getDistinctName(...)`; read `BY` and choose the comparison direction.

### `math_number_property` WHOLE excludes negatives
- **Severity:** 🟡 Low · **Location:** `math/math_number_property.ts:21-23`
- **Issue:** `number >= 0 && Math.floor(number) == number` — `-3` is whole but reports `false`. Also evaluates `number` twice.
- **Fix:** Drop the `>= 0` clause.

### `controls_if` reads private mutator fields
- **Severity:** 🟡 Low · **Location:** `logic/controls_if.ts:15,23`
- **Issue:** Relies on `block.elseifCount_` / `elseCount_` (internal Blockly fields). Works today but fragile; output uses `}\nelse if` (compiles, minor style).
- **Fix (optional):** Probe `getInput('IF'+i)` until null.

---

## Recommended fix order

1. **Compilation blockers** — §1 `gamerule` (`GameRule` class), §4 double‑dot subcommands, §2 `create_entity` `WORLD` fallback / entity ID sanitization.
2. **Silent data loss / wrong output** — §2 `get/set_entity` property mapping, §6 `lists_setIndex` undefined, `lists_sort`/`lists_getSublist`, `controls_for` `BY`.
3. **Correctness polish** — §3 `chat_message` Component wrapping, §5 `text_join`/`text_getSubstring`, §6 `math_number_property`.
4. **Cosmetic / low** — §4 indentation & sender cast, §1 `spawn_particle` enum, §6 `controls_if` private fields, orphan `drop_item` generator.
