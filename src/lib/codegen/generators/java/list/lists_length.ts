import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';
// TODO: Check if this works properly. Returns new ArrayList<>(Arrays.asList(null, null, null)).size() which makes no sense.
export default {
  block: 'lists_length',
  generator: function(block: Blockly.Block) {
    const list = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || 'new ArrayList<>()';
    return [`${list}.size()`, Order.ATOMIC];
  },
};