import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'logic_compare',
  generator: function(block: Blockly.Block) {
    const operatorString = block.getFieldValue('OP');
    const order = operatorString === 'EQ' || operatorString === 'NEQ' ? Order.EQUALITY : Order.RELATIONAL;
    const left = JavaGenerator.valueToCode(block, 'A', order);
    const right = JavaGenerator.valueToCode(block, 'B', order);
    let operator;
    switch (operatorString) {
        case 'EQ': operator = '=='; break;
        case 'NEQ': operator = '!='; break;
        case 'GT': operator = '>'; break;
        case 'GTE': operator = '>='; break;
        case 'LT': operator = '<'; break;
        case 'LTE': operator = '<='; break;
    }
    const code = left + ' ' + operator + ' ' + right;
    return [code, order];
  },
};