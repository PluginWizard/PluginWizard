import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'math_trig',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        SIN: 'Math.sin',
        COS: 'Math.cos',
        TAN: 'Math.tan',
        ASIN: 'Math.asin',
        ACOS: 'Math.acos',
        ATAN: 'Math.atan'
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const operator = OPERATORS[op];
    const argument0 = JavaGenerator.valueToCode(block, 'NUM', Order.ATOMIC);
    const code = operator + '(' + argument0 + ')';
    return [code, Order.ATOMIC];
  },
};