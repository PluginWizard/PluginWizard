import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'math_modulo',
  generator: function(block: Blockly.Block) {
    const dividend = JavaGenerator.valueToCode(block, 'DIVIDEND', Order.ATOMIC);
    const divisor = JavaGenerator.valueToCode(block, 'DIVISOR', Order.ATOMIC);
    const code = dividend + ' % ' + divisor;
    return [code, Order.ATOMIC];
  },
};