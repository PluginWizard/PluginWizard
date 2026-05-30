import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'math_on_list',
  generator: function(block: Blockly.Block) {
    const mode = block.getFieldValue('OP');
    const list = JavaGenerator.valueToCode(block, 'LIST', Order.ATOMIC);
    let code;

    switch (mode) {
        case 'SUM':
            code = 'sum(' + list + ')'; // TODO: Implement sum function
            break;
        case 'AVERAGE':
            code = 'average(' + list + ')'; // TODO: Implement average function
            break;
        case 'MIN':
            code = 'min(' + list + ')'; // TODO: Implement min function
            break;
        case 'MAX':
            code = 'max(' + list + ')'; // TODO: Implement max function
            break;
        case 'MEDIAN':
            code = 'median(' + list + ')'; // TODO: Implement median function
            break;
        case 'MODE':
            code = 'mode(' + list + ')'; // TODO: Implement mode function
            break;
        case 'STD_DEV':
            code = 'stdDev(' + list + ')'; // TODO: Implement stdDev function
            break;
        case 'RANDOM':
            code = 'random(' + list + ')'; // TODO: Implement random function
            break;
        default:
            throw new Error('Unknown operation: ' + mode);
    }
    return [code, Order.ATOMIC];
  },
};