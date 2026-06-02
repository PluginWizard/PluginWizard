import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'math_exact',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        INCREMENT_EXACT: 'Math.incrementExact',
        DECREMENT_EXACT: 'Math.decrementExact',
        NEGATE_EXACT: 'Math.negateExact'
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const operator = OPERATORS[op];
    const argument0 = JavaGenerator.valueToCode(block, 'NUM', Order.ATOMIC);
    const code = operator + '(' + argument0 + ')';
    return [code, Order.ATOMIC];
  },
};

export const math_exact_binary = {
  block: 'math_exact_binary',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        ADD_EXACT: 'Math.addExact',
        SUBTRACT_EXACT: 'Math.subtractExact',
        MULTIPLY_EXACT: 'Math.multiplyExact'
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const operator = OPERATORS[op];
    const a = JavaGenerator.valueToCode(block, 'A', Order.ATOMIC);
    const b = JavaGenerator.valueToCode(block, 'B', Order.ATOMIC);
    const code = operator + '(' + a + ', ' + b + ')';
    return [code, Order.ATOMIC];
  },
};
