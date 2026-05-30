import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'math_round_advanced',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        RINT: 'Math.rint'
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const operator = OPERATORS[op];
    const argument0 = JavaGenerator.valueToCode(block, 'NUM', Order.ATOMIC);
    const code = operator + '(' + argument0 + ')';
    return [code, Order.ATOMIC];
  },
};

export const math_ieee_remainder = {
  block: 'math_ieee_remainder',
  generator: function(block: Blockly.Block) {
    const dividend = JavaGenerator.valueToCode(block, 'DIVIDEND', Order.ATOMIC);
    const divisor = JavaGenerator.valueToCode(block, 'DIVISOR', Order.ATOMIC);
    const code = 'Math.IEEEremainder(' + dividend + ', ' + divisor + ')';
    return [code, Order.ATOMIC];
  },
};
