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

---

## 3. Design Issues That Need Rethinking

**An issue has been created for this task**

These are structural problems in the block definitions or generator architecture that can't be fixed with a one-line change.

### 3.1 `item_flags` — duplicate field names

**File:** `src/lib/editor/blocks/custom/item.json` — `item_flags` block

All 10 checkboxes share the field name `"CHECKBOX"`. Blockly only stores one value per field name, so `block.getFieldValue('CHECKBOX')` would only return the value of the last checkbox. A generator for this block currently cannot read individual flag states.

**Fix:** Give each checkbox a unique name matching the flag it controls, e.g., `HIDE_ARMOR_TRIMS`, `HIDE_ATTRIBUTES`, `HIDE_DESTROYS`, `HIDE_DYE`, `HIDE_ENCHANTS`, `HIDE_UNBREAKABLE`, `HIDE_DAMAGE`, `HIDE_LORE`, `HIDE_DURABILITY`, `UNBREAKABLE`.

---

*Generated 2026-06-02 against commit `e300f13`.*
