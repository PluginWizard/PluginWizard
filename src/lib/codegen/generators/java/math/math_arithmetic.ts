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
    const order = op === 'MULTIPLY' || op === 'DIVIDE' ? Order.MULTIPLICATIVE : Order.ADDITIVE;
    const left = JavaGenerator.valueToCode(block, 'A', order);
    const right = JavaGenerator.valueToCode(block, 'B', order);

    if (op === 'POWER') {
      return [`Math.pow(${left}, ${right})`, Order.ATOMIC];
    } else {
      return [`${left} ${operator} ${right}`, order];
    }
  },
};