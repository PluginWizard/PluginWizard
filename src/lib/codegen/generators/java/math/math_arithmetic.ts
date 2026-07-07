import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'math_arithmetic',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        ADD: '+',
        MINUS: '-',
        MULTIPLY: '*',
        DIVIDE: '/',
        POWER: ''
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const operator = OPERATORS[op];
    const left = JavaGenerator.valueToCode(block, 'A', Order.ATOMIC);
    const right = JavaGenerator.valueToCode(block, 'B', Order.ATOMIC);

    if (op === 'POWER') {
      return [`Math.pow(${left}, ${right})`, Order.ATOMIC];
    } else {
      return [`${left} ${operator} ${right}`, Order.ATOMIC];
    }
  },
};