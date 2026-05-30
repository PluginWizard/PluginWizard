import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'text_replace',
  generator: function(block: Blockly.Block) {
    const text = JavaGenerator.valueToCode(block, 'TEXT', Order.ATOMIC);
    const from = JavaGenerator.valueToCode(block, 'FROM', Order.ATOMIC);
    const to = JavaGenerator.valueToCode(block, 'TO', Order.ATOMIC);
    const code = `${text}.replace(${from}, ${to})`;
    return [code, Order.ATOMIC];
  },
};