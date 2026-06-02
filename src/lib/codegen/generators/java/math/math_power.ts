import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'math_power',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        CBRT: 'Math.cbrt'
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const operator = OPERATORS[op];
    const argument0 = JavaGenerator.valueToCode(block, 'NUM', Order.ATOMIC);
    const code = operator + '(' + argument0 + ')';
    return [code, Order.ATOMIC];
  },
};

export const math_pow = {
  block: 'math_pow',
  generator: function(block: Blockly.Block) {
    const base = JavaGenerator.valueToCode(block, 'BASE', Order.ATOMIC);
    const exponent = JavaGenerator.valueToCode(block, 'EXPONENT', Order.ATOMIC);
    const code = 'Math.pow(' + base + ', ' + exponent + ')';
    return [code, Order.ATOMIC];
  },
};

export const math_cbrt = {
  block: 'math_cbrt',
  generator: function(block: Blockly.Block) {
    const argument0 = JavaGenerator.valueToCode(block, 'NUM', Order.ATOMIC);
    const code = 'Math.cbrt(' + argument0 + ')';
    return [code, Order.ATOMIC];
  },
};

export const math_hypot = {
  block: 'math_hypot',
  generator: function(block: Blockly.Block) {
    const x = JavaGenerator.valueToCode(block, 'X', Order.ATOMIC);
    const y = JavaGenerator.valueToCode(block, 'Y', Order.ATOMIC);
    const code = 'Math.hypot(' + x + ', ' + y + ')';
    return [code, Order.ATOMIC];
  },
};
