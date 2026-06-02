import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'math_trig_advanced',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        TO_DEGREES: 'Math.toDegrees',
        TO_RADIANS: 'Math.toRadians'
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const operator = OPERATORS[op];
    const argument0 = JavaGenerator.valueToCode(block, 'NUM', Order.ATOMIC);
    const code = operator + '(' + argument0 + ')';
    return [code, Order.ATOMIC];
  },
};

export const math_atan2 = {
  block: 'math_atan2',
  generator: function(block: Blockly.Block) {
    const y = JavaGenerator.valueToCode(block, 'Y', Order.ATOMIC);
    const x = JavaGenerator.valueToCode(block, 'X', Order.ATOMIC);
    const code = 'Math.atan2(' + y + ', ' + x + ')';
    return [code, Order.ATOMIC];
  },
};
