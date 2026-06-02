import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'text_isEmpty',
  generator: function(block: Blockly.Block) {
    const text = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC);
    const code = text + '.isEmpty()';
    return [code, Order.ATOMIC];
  },
};