import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'string_value_of',
  generator: function(block: Blockly.Block) {
    const value = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC);
    const code = `String.valueOf(${value})`;
    return [code, Order.ATOMIC];
  },
};