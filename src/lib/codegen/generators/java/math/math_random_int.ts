import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'math_random_int',
  generator: function(block: Blockly.Block) {
    const from = JavaGenerator.valueToCode(block, 'FROM', Order.ATOMIC);
    const to = JavaGenerator.valueToCode(block, 'TO', Order.ATOMIC);
    const code = 'randomInt(' + from + ', ' + to + ')'; // TODO: Implement randomInt function
    return [code, Order.ATOMIC];
  },
};