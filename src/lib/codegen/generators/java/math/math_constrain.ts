import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'math_constrain',
  generator: function(block: Blockly.Block) {
    const value = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC);
    const low = JavaGenerator.valueToCode(block, 'LOW', Order.ATOMIC);
    const high = JavaGenerator.valueToCode(block, 'HIGH', Order.ATOMIC);
    const code = 'Math.max(' + low + ', Math.min(' + value + ', ' + high + '))';
    return [code, Order.ATOMIC];
  },
};