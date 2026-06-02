import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'text_reverse',
  generator: function(block: Blockly.Block) {
    const text = JavaGenerator.valueToCode(block, 'TEXT', Order.ATOMIC);
    const code = `new StringBuilder(${text}).reverse().toString()`;
    return [code, Order.ATOMIC];
  },
};