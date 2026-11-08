import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java.js';

/**
 * Collects the blocks of one type from whatever is plugged into an input.
 * This accepts either a single block of that type or a list block
 * (e.g. `lists_create_with`) whose children are blocks of that type.
 */
function collectBlocks(block: Blockly.Block | null, type: string): Blockly.Block[] {
  if (!block) return [];
  if (block.type === type) return [block];

  // A list of blocks: read each enabled, connected child.
  const blocks: Blockly.Block[] = [];
  for (const input of block.inputList) {
    const target = input.connection?.targetBlock();
    if (target && target.type === type && target.isEnabled()) {
      blocks.push(target);
    }
  }
  return blocks;
}

/** A valid enchantment level: a whole number from 1 to 255, as the Core library requires. */
export function enchantmentLevel(block: Blockly.Block): number {
  const level = Math.round(Number(block.getFieldValue('LEVEL')));
  return Number.isFinite(level) ? Math.min(Math.max(level, 1), 255) : 1;
}

export default {
  block: 'create_item',
  generator: function(block: Blockly.Block) {
    const itemMaterialString = block.getFieldValue('ITEM_MATERIAL') || 'BARRIER';
    const material = itemMaterialString.trim().substring(itemMaterialString.indexOf(':') + 1).toUpperCase();
    const itemName = JavaGenerator.valueToCode(block, 'ITEM_NAME', Order.ATOMIC);
    const lore = JavaGenerator.valueToCode(block, 'LORE', Order.ATOMIC);
    const flags = collectBlocks(block.getInputTargetBlock('FLAGS'), 'item_flag').map((flag) => flag.getFieldValue('FLAG'));
    const enchantments = collectBlocks(block.getInputTargetBlock('ENCHANTS'), 'item_enchantment');

    let code = `Helpers.itemHelper.newItem().material(Material.${material})`;

    if (itemName) {
      code += `.name(${itemName})`;
    }

    if (lore) {
      code += `.lore(${lore})`;
    }

    for (const flag of flags) {
      if (flag === 'UNBREAKABLE') {
        code += `.setUnbreakable(true)`;
      } else {
        code += `.itemFlag(ItemFlag.${flag})`;
        imports.add('import org.bukkit.inventory.ItemFlag;');
      }
    }

    for (const enchantment of enchantments) {
      code += `.enchant(Enchantment.${enchantment.getFieldValue('ENCHANTMENT')}, ${enchantmentLevel(enchantment)})`;
      imports.add('import org.bukkit.enchantments.Enchantment;');
    }

    code += `.build()`;

    imports.add('import org.bukkit.Material;');

    return [code, Order.ATOMIC];
  },
};
