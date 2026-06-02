import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';
// TODO: Check for this as well
export default {
  block: 'lists_isEmpty',
  generator: function(block: Blockly.Block) {
    const list = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || 'new ArrayList<>()';
    return [`${list}.isEmpty()`, Order.ATOMIC];
  },
};