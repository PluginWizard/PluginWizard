import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'math_round',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        ROUND: 'Math.round',
        ROUNDDOWN: 'Math.floor',
        ROUNDUP: 'Math.ceil'
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const argument0 = JavaGenerator.valueToCode(block, 'NUM', Order.ATOMIC);
    const code = OPERATORS[op] + '(' + argument0 + ')';
    return [code, Order.ATOMIC];
  },
};