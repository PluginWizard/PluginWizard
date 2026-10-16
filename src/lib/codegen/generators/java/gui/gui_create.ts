import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java.js';

export default {
  block: 'gui_create',
  generator: function(block: Blockly.Block) {
    const layout = block.getFieldValue('LAYOUT') || '3';
    const title = JavaGenerator.valueToCode(block, 'TITLE', Order.ATOMIC) || '""';
    const locked = block.getFieldValue('LOCKED') === 'TRUE';

    // Chest layouts are stored as their row count, everything else is an InventoryType.
    let size = layout;
    if (isNaN(Number(layout))) {
      size = `InventoryType.${layout}`;
      imports.add('import org.bukkit.event.inventory.InventoryType;');
    }

    return [`Helpers.guiHelper.createInventory(${size}, ${title}, ${locked})`, Order.ATOMIC];
  },
};
