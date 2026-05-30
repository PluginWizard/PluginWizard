import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'logic_negate',
  generator: function(block: Blockly.Block) {
    const argument0 = JavaGenerator.valueToCode(block, 'BOOL', Order.ATOMIC);
    const code = '!' + argument0;
    return [code, Order.ATOMIC];
  },
};