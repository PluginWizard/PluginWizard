import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'lists_shuffle',
  generator: function(block: Blockly.Block) {
    const list = JavaGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || 'new ArrayList<>()';
    return `Collections.shuffle(${list});\n`;
  },
};