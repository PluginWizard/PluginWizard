import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'math_on_list',
  generator: function(block: Blockly.Block) {
    const mode = block.getFieldValue('OP');
    const list = JavaGenerator.valueToCode(block, 'LIST', Order.ATOMIC);
    let code;

    switch (mode) {
        case 'SUM':
            code = `Helpers.mathHelper.listSum(${list})`;
            break;
        case 'AVERAGE':
            code = `Helpers.mathHelper.listAverage(${list})`;
            break;
        case 'MIN':
            code = `Helpers.mathHelper.listMin(${list})`;
            break;
        case 'MAX':
            code = `Helpers.mathHelper.listMax(${list})`;
            break;
        case 'MEDIAN':
            code = `Helpers.mathHelper.listMedian(${list})`;
            break;
        case 'MODE':
            code = `Helpers.mathHelper.listModes(${list})`;
            break;
        case 'STD_DEV':
            code = `Helpers.mathHelper.listStandardDeviation(${list})`;
            break;
        case 'RANDOM':
            code = `Helpers.mathHelper.listRandomItem(${list})`;
            break;
        default:
            throw new Error('Unknown operation: ' + mode);
    }
    return [code, Order.ATOMIC];
  },
};