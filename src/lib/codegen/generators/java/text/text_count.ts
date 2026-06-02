import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'text_count',
  generator: function(block: Blockly.Block) {
    const text = JavaGenerator.valueToCode(block, 'TEXT', Order.ATOMIC);
    const sub = JavaGenerator.valueToCode(block, 'SUB', Order.ATOMIC);
    const code = `${text}.split(${sub}).length - 1`;
    return [code, Order.ATOMIC];
  },
};