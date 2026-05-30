import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'lists_reverse',
  generator: function(block: Blockly.Block) {
    const list = JavaGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || 'new ArrayList<>()';
    return `Collections.reverse(${list});\n`;
  },
};