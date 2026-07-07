import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'give_item_slot',
  generator: function(block: Blockly.Block) {
    const slot = JavaGenerator.valueToCode(block, 'SLOT', Order.ATOMIC) || '0';
    const item = JavaGenerator.valueToCode(block, 'ITEM', Order.ATOMIC) || 'null';
    const amount = JavaGenerator.valueToCode(block, 'AMOUNT', Order.ATOMIC) || '1';
    const receiver = JavaGenerator.valueToCode(block, 'RECEIVER', Order.ATOMIC) || 'null';
    return `Helpers.playerItemHelper.setItem(${item}, ${slot}, ${amount}, ${receiver});\n`;
  },
};