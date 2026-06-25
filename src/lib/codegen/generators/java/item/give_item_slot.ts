import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java.js';

export default {
  block: 'give_item_slot',
  generator: function(block: Blockly.Block) {
    const slot = JavaGenerator.valueToCode(block, 'SLOT', Order.ATOMIC) || 'null';
    const item = JavaGenerator.valueToCode(block, 'ITEM', Order.ATOMIC) || 'null';
    const amount = JavaGenerator.valueToCode(block, 'AMOUNT', Order.ATOMIC) || '1';
    const receiver = JavaGenerator.valueToCode(block, 'RECEIVER', Order.ATOMIC) || 'null';

    const code = `Helpers.playerItemHelper.setItem(${item}, ${slot}, ${amount}, ${receiver});\n`;

    imports.add('import org.bukkit.Material;');

    return code;
  },
};