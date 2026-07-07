import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'math_modulo',
  generator: function(block: Blockly.Block) {
    const dividend = JavaGenerator.valueToCode(block, 'DIVIDEND', Order.MULTIPLICATIVE);
    const divisor = JavaGenerator.valueToCode(block, 'DIVISOR', Order.MULTIPLICATIVE);
    const code = dividend + ' % ' + divisor;
    return [code, Order.MULTIPLICATIVE];
  },
};