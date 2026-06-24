import * as Blockly from 'blockly';
import { Order, imports } from '../../java.js';

export default {
  block: 'string_to_item',
  generator: function(block: Blockly.Block) {
    const itemString = block.getFieldValue('ITEM') || '';
    const item = itemString.trim().substring(itemString.indexOf(':') + 1).toUpperCase();
    const code = `Helpers.itemHelper.newItem().material(Material.${item}).build()`;

    imports.add('import org.bukkit.Material;');

    return [code, Order.ATOMIC];
  },
};