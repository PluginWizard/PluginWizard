import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'logic_negate',
  generator: function(block: Blockly.Block) {
    const argument0 = JavaGenerator.valueToCode(block, 'BOOL', Order.UNARY);
    const code = '!' + argument0;
    return [code, Order.UNARY];
  },
};