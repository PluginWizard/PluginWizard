import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'math_number_property',
  generator: function(block: Blockly.Block) {
    const number = JavaGenerator.valueToCode(block, 'NUMBER_TO_CHECK', Order.ATOMIC);
    const property = block.getFieldValue('PROPERTY');
    let code;

    switch (property) {
        case 'EVEN':
            code = number + ' % 2 == 0';
            break;
        case 'ODD':
            code = number + ' % 2 != 0';
            break;
        case 'PRIME':
            code = 'isPrime(' + number + ')'; // TODO: Implement isPrime function
        case 'WHOLE':
            code = number + ' >= 0 && Math.floor(' + number + ') == ' + number;
            break;
        case 'POSITIVE':
            code = number + ' > 0';
            break;
        case 'NEGATIVE':
            code = number + ' < 0';
            break;
        case 'DIVISIBLE_BY':
            const divisor = JavaGenerator.valueToCode(block, 'DIVISOR', Order.ATOMIC);
            code = number + ' % ' + divisor + ' == 0';
            break;
        default:
            throw new Error('Unknown property: ' + property);
    }
    return [code, Order.ATOMIC];
  },
};