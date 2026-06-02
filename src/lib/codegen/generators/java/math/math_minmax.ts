import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'math_minmax',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        MIN: 'Math.min',
        MAX: 'Math.max'
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const operator = OPERATORS[op];
    const a = JavaGenerator.valueToCode(block, 'A', Order.ATOMIC);
    const b = JavaGenerator.valueToCode(block, 'B', Order.ATOMIC);
    const code = operator + '(' + a + ', ' + b + ')';
    return [code, Order.ATOMIC];
  },
};
