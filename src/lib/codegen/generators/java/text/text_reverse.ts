import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'text_reverse',
  generator: function(block: Blockly.Block) {
    const text = JavaGenerator.valueToCode(block, 'TEXT', Order.ATOMIC);
    const code = `${text}.reverse()`; // TODO: Implement reverse method
    return [code, Order.ATOMIC];
  },
};