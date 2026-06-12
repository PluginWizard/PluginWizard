# Code Translation Status

This document tracks the status of all Blockly-to-Java code generators (`src/lib/codegen/generators/java/`), cross-referenced against every custom block defined in `src/lib/editor/blocks/custom/`.

"Translation" here means the generator that converts a placed Blockly block into Java source code. A block without a generator silently produces no output.

---

## Summary

| Category | Blocks Defined | Generators | Missing | Has Bugs |
|---|---|---|---|---|
| Command / Event | 9 | 9 | 0 | 3 |
| Config | 6 | 6 | 0 | 0 |
| Display | 10 | 0 | **10** | — |
| Entity | 7 | 0 | **7** | — |
| Function | 5 | 5 | 0 | 0 |
| Item | 6 | 0 | **6** | — |
| Math (custom) | 2 | 1 | **1** | 0 |
| Message | 4 | 4 | 0 | 0 |
| Player | 6 | 0 | **6** | — |
| Region | 5 | 5 | 0 | 2 |
| Sound | 2 | 2 | 0 | 1 |
| Teleport | 3 | 3 | 0 | 1 |
| Text | 1 | 1 | 0 | 0 |
| Title | 3 | 3 | 0 | 2 |
| Variable | 3 | 3 | 0 | 1 |
| World | 8 | 8 | 0 | 3 |
| **Total** | **80** | **50** | **30** | **13** |

---

## 1. Missing Generators (blocks that produce no output)

### Display — 10 blocks (entire category)

No generator directory exists. All display entity blocks are silent.

| Block | File needed |
|---|---|
| `create_display_entity` | `java/display/create_display_entity.ts` |
| `set_display_position` | `java/display/set_display_position.ts` |
| `set_display_rotation` | `java/display/set_display_rotation.ts` |
| `set_display_scale` | `java/display/set_display_scale.ts` |
| `set_display_entity_model` | `java/display/set_display_entity_model.ts` |
| `set_display_item` | `java/display/set_display_item.ts` |
| `set_display_text` | `java/display/set_display_text.ts` |
| `set_display_visibility` | `java/display/set_display_visibility.ts` |
| `on_click_display` | `java/display/on_click_display.ts` |
| `delete_display_entity` | `java/display/delete_display_entity.ts` |

Display entities are tracked by string ID. The generator needs to manage a `Map<String, Entity>` (or similar) in the plugin class to store them, and produce the right Bukkit Display API calls.

### Entity — 7 blocks (entire category)

No generator directory exists. All entity blocks are silent.

| Block | File needed |
|---|---|
| `create_entity` | `java/entity/create_entity.ts` |
| `teleport_entity` | `java/entity/teleport_entity.ts` |
| `entity_events` | `java/entity/entity_events.ts` |
| `entity_event_player` | `java/entity/entity_event_player.ts` |
| `set_entity` | `java/entity/set_entity.ts` |
| `get_entity` | `java/entity/get_entity.ts` |
| `entity_pose` | `java/entity/entity_pose.ts` |

Like display entities, `create_entity` / `teleport_entity` / `set_entity` / `get_entity` all track entities by string ID and will need a shared map.

### Item — 6 blocks (entire category)

No generator directory exists.

| Block | File needed | Notes |
|---|---|---|
| `string_to_item` | `java/item/string_to_item.ts` | Simple `Material.matchMaterial()` lookup |
| `create_item` | `java/item/create_item.ts` | `ItemStack` builder with lore and flags |
| `item_flags` | `java/item/item_flags.ts` | **Block definition is broken — see §3** |
| `give_item` | `java/item/give_item.ts` | |
| `give_item_slot` | `java/item/give_item_slot.ts` | |
| `drop_item` | `java/item/drop_item.ts` | |

`item_flags` cannot be correctly generated until its block definition is fixed (§3.1).

### Player — 6 blocks (entire category)

No generator directory exists.

| Block | File needed | Notes |
|---|---|---|
| `player` | `java/player/player.ts` | Returns the event player variable |
| `player_get` | `java/player/player_get.ts` | Appends the selected getter to the player expression |
| `player_set` | `java/player/player_set.ts` | The dropdown values embed partial method calls — see §3 |
| `player_game_modes` | `java/player/player_game_modes.ts` | Returns `GameMode.SURVIVAL` etc. |
| `player_methods` | `java/player/player_methods.ts` | |
| `player_location` | `java/player/player_location.ts` | Dropdown labels show Java syntax — see §3 |

### Math — 1 block

| Block | File needed |
|---|---|
| `math_random_range` | `java/math/math_random_range.ts` |

Should generate `(int)(Math.random() * (TO - FROM + 1)) + FROM` or use `ThreadLocalRandom.current().nextInt(FROM, TO + 1)`.

---

## 2. Generators with Bugs

These files exist but produce incorrect or broken output.

### 2.4 Wrong method call — `display_subtitle.ts`

**File:** `java/title/display_subtitle.ts:14`

```ts
return `Helpers.titleHelper.displayTitle(${target}, "", ${text}, ...);\n`;
```

`display_subtitle` calls `displayTitle()` with an empty string as the title argument. It should call `displaySubtitle()` (or whatever the correct helper method is). The current output sets a blank title alongside the subtitle, and may cause unexpected results if the helper signatures differ.

**Fix:** Change to call the correct subtitle method, e.g., `Helpers.titleHelper.displaySubtitle(...)`.

### 2.5 Wrong field name — `region_events.ts`

**File:** `java/regions/region_events.ts:8`

```ts
const eventType = block.getFieldValue('EVENT_TYPE') || 'onRegionEnter';
```

The block definition (`region.json`) names the field `PLAYER_EVENT`, not `EVENT_TYPE`. Always generates `onRegionEnter` regardless of user selection.

**Fix:** Change `'EVENT_TYPE'` to `'PLAYER_EVENT'`.


### 2.7 Missing `Helpers.` prefix — `teleport_player.ts` / `teleport_player_location.ts`

**Files:** `java/teleport/teleport_player.ts:11`, `java/teleport/teleport_player_location.ts:9`

```ts
return `teleportPlayerHelper.teleportEntity(...);\n`;
```

All other helpers follow the `Helpers.xHelper.method()` pattern (e.g., `Helpers.soundHelper`, `Helpers.regionHelper`). `teleportPlayerHelper` is a bare identifier that is not imported or declared. At runtime this will fail with a compilation error unless `teleportPlayerHelper` happens to be a field that's already in scope.

**Fix:** Change to `Helpers.teleportHelper.teleportEntity(...)` (or whatever the correct helper name is in `Helpers.java`).

### 2.8 Float values truncated — `play_sound.ts` / `play_sound_at.ts`

**Files:** `java/sound/play_sound.ts:14`, `java/sound/play_sound_at.ts:14`

```ts
return `Helpers.soundHelper.playSound(${target}, Sound.${sound}, ${parseInt(volume)}, ${parseInt(pitch)});\n`;
```

The block allows volume and pitch between 0 and 2 (floats). `parseInt` truncates `0.5` to `0`, making it impossible to set any value below 1. The Bukkit `playSound` API accepts floats.

**Fix:** Use `parseFloat(volume)` and `parseFloat(pitch)`, or just pass the raw field value directly.

### 2.9 Fragile world extraction — `spawn_particle.ts` / `location_get_block.ts`

**Files:** `java/world/spawn_particle.ts`, `java/world/location_get_block.ts`

```ts
const world = getWorldFromLocation(location);
// …
`Bukkit.getWorld("${world}").spawnParticle(…)`
```

`getWorldFromLocation()` parses the world name by splitting the location string on `"` and `,`. This only works if the location was produced by `create_location`, which encodes location as `Helpers.locationHelper.stringToLocation("worldName,x,y,z")`. If the location comes from any other source (e.g., `event.getLocation()`, `player.getLocation()`), the extraction fails silently and generates `Bukkit.getWorld("").spawnParticle(…)`.

**This approach needs rethinking** — see §3.4.

---

## 3. Design Issues That Need Rethinking

These are structural problems in the block definitions or generator architecture that can't be fixed with a one-line change.

### 3.1 `item_flags` — duplicate field names

**File:** `src/lib/editor/blocks/custom/item.json` — `item_flags` block

All 10 checkboxes share the field name `"CHECKBOX"`. Blockly only stores one value per field name, so `block.getFieldValue('CHECKBOX')` would only return the value of the last checkbox. A generator for this block currently cannot read individual flag states.

**Fix:** Give each checkbox a unique name matching the flag it controls, e.g., `HIDE_ARMOR_TRIMS`, `HIDE_ATTRIBUTES`, `HIDE_DESTROYS`, `HIDE_DYE`, `HIDE_ENCHANTS`, `HIDE_UNBREAKABLE`, `HIDE_DAMAGE`, `HIDE_LORE`, `HIDE_DURABILITY`, `UNBREAKABLE`.

### 3.2 `player_set` — partial method calls embedded in dropdown values

**File:** `src/lib/editor/blocks/custom/player.json` — `player_set` block

Dropdown values include raw partial Java code with a trailing open parenthesis, e.g., `".setHealth("`. This encoding makes the block definition fragile (tied to exactly one code generation style) and unusable for anything other than simple string concatenation.

**Recommended approach:** Use clean semantic values like `"health"`, `"maxHealth"`, etc., and let the generator map them to the correct method calls. This matches how `entity.json` already handles `set_entity`.

### 3.3 `player_location` — Java method syntax as display labels

**File:** `src/lib/editor/blocks/custom/player.json` — `player_location` block

The dropdown option display labels are Java method signatures: `".getX()"`, `".getBlockX()"`, etc. Users see raw Java instead of plain labels like "X", "Y", "Z", "World", "Block X", "Block Y", "Block Z".

**Fix:** Separate the user-visible label from the code value, the same way `player_get` does it (e.g., `["X", ".getX()"]`).

### 3.4 Location encoding — fragile string serialisation

**Files:** `java/teleport/create_loaction.ts` (note: filename typo — should be `create_location.ts`), `java/world/spawn_particle.ts`, `java/world/location_get_block.ts`

The `create_location` generator encodes a `Location` as a single string literal by embedding the world and coordinates into a call to `Helpers.locationHelper.stringToLocation("world,x,y,z")`. Generators that need the world separately (spawn particle, get block) then try to reverse-engineer the world name by string-splitting this literal. This only works for statically-known locations.

The root cause is that Java `Location` objects cannot be passed as an expression — they must be assigned to a variable. Two possible approaches:

- **Option A:** Emit a `Location loc_N = new Location(...)` declaration before the block that uses the location, and pass the variable name as the expression. This requires the generator to emit statements from a value block, which is non-standard.
- **Option B:** Keep the current `stringToLocation` helper but also add a `getWorldFromLocation(Location)` Java helper, so the world extraction happens at runtime in Java, not at code-generation time.

### 3.5 `variables_declare` / `variables_set` / `variables_get` — nameDB used with `field_input`

**Files:** `java/variable/variables_declare.ts`, `java/variable/variables_set.ts`, `java/variable/variables_get.ts`

The blocks use `field_input` for the variable name (free-text), but the generators call `JavaGenerator.nameDB_?.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME)`. The name database is populated from Blockly's `field_variable` fields only — `field_input` values are never registered. This means `nameDB_.getName()` may mangle the name or return an unexpected result.

If the intent is to use Blockly's built-in variable system, the blocks should use `field_variable`. If the intent is to use free-text names (current UX), the generators should just use `block.getFieldValue('VAR')` directly, without going through `nameDB_`.

### 3.6 `controls_if` — multi-branch `if/else if/else` not handled

**File:** `java/logic/controls_if.ts`

The standard Blockly `controls_if` block supports adding multiple `elseif` and `else` branches via the block's mutator. The current generator only handles `IF0` / `DO0` — the first condition and body. Any additional `elseif` or `else` branches are silently dropped.

**Fix:** Iterate over `block.elseifCount_` and `block.elseCount_` (or inspect `block.inputList`) and emit the corresponding `else if (...) {}` and `else {}` clauses.

### 3.7 `region_settings` — `ENABLED` checkbox returns string, not boolean

**File:** `java/regions/region_settings.ts:8`

```ts
const enabled = block.getFieldValue('ENABLED');
if (enabled) { … }
```

`getFieldValue` on a `field_checkbox` returns the string `"TRUE"` or `"FALSE"`, not a JS boolean. The `if (enabled)` check is always truthy (a non-empty string), so `removeRegionFlag` is never called.

**Fix:** Change to `if (enabled === 'TRUE')`.

---

## 4. Minor / Cosmetic Issues in Block Definitions

These do not affect code generation correctness but should be cleaned up.

| File | Issue |
|---|---|
| `entity.json` (line 157) | `"inpitsInline": true` — typo, should be `"inputsInline"`. The property is silently ignored. |
| `entity.json` | `"allways show name"` — typo in two places, should be `"always show name"`. |
| `player.json` | `"helpkUrl": ""` — typo on `player` block, should be `"helpUrl"`. |
| `command.json` | `command_argument` tooltip says "custom argument type" but describes a standard typed argument, not a custom one. |
| `teleport/create_loaction.ts` | Filename typo — should be `create_location.ts`. |
| `toolbox/entities.json` | Category label `"Entitys"` — should be `"Entities"`. |
| `play_sound.ts` tooltip | `"Play a sound a sound"` — duplicated word. |

---

## 5. Standard Blockly Block Generators

The project also ships custom generators for standard Blockly blocks (logic, loops, math, lists, text). These are implemented but several are partial:

| Block | Status |
|---|---|
| `controls_if` | Partial — only handles single `if`, not `else if` / `else` (see §3.6) |
| `controls_ifelse` | Separate file handles `if/else` only, not `else if` chains |
| `controls_for` | Implemented |
| `controls_forEach` | Implemented |
| `controls_repeat_ext` | Implemented |
| `controls_whileUntil` | Implemented |
| `controls_flow_statements` | Implemented (`break`/`continue`) |
| `logic_*` | All implemented |
| `math_*` | All implemented (many cover advanced operations unlikely to be needed) |
| `lists_*` | All implemented |
| `text_*` | All implemented |

---

*Generated 2026-06-02 against commit `e300f13`.*
