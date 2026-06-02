import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'logic_compare',
  generator: function(block: Blockly.Block) {
    const left = JavaGenerator.valueToCode(block, 'A', Order.ATOMIC);
    const right = JavaGenerator.valueToCode(block, 'B', Order.ATOMIC);
    const operatorString = block.getFieldValue('OP');
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
    return [code, Order.ATOMIC];
  },
};