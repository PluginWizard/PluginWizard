import * as Blockly from 'blockly';
import { Order } from '../../java.js';

export default {
  block: 'math_number',
  generator: function(block: Blockly.Block) {
    const code = block.getFieldValue('NUM') || '0';
    return [code, Order.ATOMIC];
  },
};