import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'math_single',
  generator: function(block: Blockly.Block) {
    const OPERATORS = {
        ROOT: 'Math.sqrt',
        ABS: 'Math.abs',
        NEG: '-',
        LN: 'Math.log',
        LOG10: 'Math.log10',
        EXP: 'Math.exp',
        POW10: 'Math.pow'
    };
    const op = block.getFieldValue('OP') as keyof typeof OPERATORS;
    const argument0 = JavaGenerator.valueToCode(
      block,
      'NUM',
      op === 'NEG' ? Order.UNARY : Order.NONE,
    );

    let code: string;
    if (op === 'NEG') {
        code = '-' + argument0;
    } else if (op === 'POW10') {
        code = 'Math.pow(10, ' + argument0 + ')';
    } else {
        code = OPERATORS[op] + '(' + argument0 + ')';
    }
    return [code, op === 'NEG' ? Order.UNARY : Order.ATOMIC];
  },
};