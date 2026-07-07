import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'give_item',
  generator: function(block: Blockly.Block) {
    const item = JavaGenerator.valueToCode(block, 'ITEM', Order.ATOMIC) || 'null';
    const amount = JavaGenerator.valueToCode(block, 'AMOUNT', Order.ATOMIC) || '1';
    const receiver = JavaGenerator.valueToCode(block, 'RECEIVER', Order.ATOMIC) || 'null';
    return `Helpers.playerItemHelper.giveItem(${item}, ${amount}, ${receiver});\n`;
  },
};