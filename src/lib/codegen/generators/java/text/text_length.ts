import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'text_length',
  generator: function(block: Blockly.Block) {
    const text = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC);
    const code = `${text}.length()`;
    return [code, Order.ATOMIC];
  },
};