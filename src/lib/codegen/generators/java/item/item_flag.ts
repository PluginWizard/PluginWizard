import * as Blockly from 'blockly';
import { Order, imports } from '../../java.js';

export default {
  block: 'item_flag',
  generator: function(block: Blockly.Block) {
    const flag = block.getFieldValue('FLAG');

    imports.add('import org.bukkit.inventory.ItemFlag;');

    return [`ItemFlag.${flag}`, Order.ATOMIC];
  },
};
