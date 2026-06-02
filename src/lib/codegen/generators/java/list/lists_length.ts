import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'lists_length',
  generator: function(block: Blockly.Block) {
    const list = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || 'new ArrayList<>()';
    return [`${list}.size()`, Order.ATOMIC];
  },
};