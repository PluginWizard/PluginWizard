import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'math_sign',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        SIGNUM: 'Math.signum'
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const operator = OPERATORS[op];
    const argument0 = JavaGenerator.valueToCode(block, 'NUM', Order.ATOMIC);
    const code = operator + '(' + argument0 + ')';
    return [code, Order.ATOMIC];
  },
};

export const math_copy_sign = {
  block: 'math_copy_sign',
  generator: function(block: Blockly.Block) {
    const magnitude = JavaGenerator.valueToCode(block, 'MAGNITUDE', Order.ATOMIC);
    const sign = JavaGenerator.valueToCode(block, 'SIGN', Order.ATOMIC);
    const code = 'Math.copySign(' + magnitude + ', ' + sign + ')';
    return [code, Order.ATOMIC];
  },
};
