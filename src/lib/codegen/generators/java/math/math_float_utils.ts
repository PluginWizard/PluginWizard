import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'math_float_utils',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        NEXT_UP: 'Math.nextUp',
        NEXT_DOWN: 'Math.nextDown',
        ULP: 'Math.ulp',
        GET_EXPONENT: 'Math.getExponent'
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const operator = OPERATORS[op];
    const argument0 = JavaGenerator.valueToCode(block, 'NUM', Order.ATOMIC);
    const code = operator + '(' + argument0 + ')';
    return [code, Order.ATOMIC];
  },
};

export const math_scalb = {
  block: 'math_scalb',
  generator: function(block: Blockly.Block) {
    const value = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC);
    const scaleFactor = JavaGenerator.valueToCode(block, 'SCALE_FACTOR', Order.ATOMIC);
    const code = 'Math.scalb(' + value + ', ' + scaleFactor + ')';
    return [code, Order.ATOMIC];
  },
};
