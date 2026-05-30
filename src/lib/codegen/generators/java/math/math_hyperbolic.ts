import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'math_hyperbolic',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        SINH: 'Math.sinh',
        COSH: 'Math.cosh',
        TANH: 'Math.tanh'
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const operator = OPERATORS[op];
    const argument0 = JavaGenerator.valueToCode(block, 'NUM', Order.ATOMIC);
    const code = operator + '(' + argument0 + ')';
    return [code, Order.ATOMIC];
  },
};
