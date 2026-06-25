import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java.js';

/**
 * Collects the selected flag values from whatever is plugged into the FLAGS
 * input. This accepts either a single `item_flag` block or a list block
 * (e.g. `lists_create_with`) whose children are `item_flag` blocks.
 */
function collectFlags(block: Blockly.Block | null): string[] {
  if (!block) return [];

  if (block.type === 'item_flag') {
    return [block.getFieldValue('FLAG')];
  }

  // A list of item_flag blocks: read each connected child.
  const flags: string[] = [];
  for (const input of block.inputList) {
    const target = input.connection?.targetBlock();
    if (target && target.type === 'item_flag') {
      flags.push(target.getFieldValue('FLAG'));
    }
  }
  return flags;
}

export default {
  block: 'create_item',
  generator: function(block: Blockly.Block) {
    const itemString = block.getFieldValue('ITEM_NAME') || '';
    const material = itemString.trim().substring(itemString.indexOf(':') + 1).toUpperCase();
    const lore = JavaGenerator.valueToCode(block, 'LORE', Order.ATOMIC);
    const flags = collectFlags(block.getInputTargetBlock('FLAGS'));

    let code = `Helpers.itemHelper.newItem().material(Material.${material})`;

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

    code += `.build()`;

    imports.add('import org.bukkit.Material;');

    return [code, Order.ATOMIC];
  },
};
