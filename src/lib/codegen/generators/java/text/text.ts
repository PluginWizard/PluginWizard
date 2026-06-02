import * as Blockly from 'blockly';
import { Order } from '../../java.js';

export default {
  block: 'text',
  generator: function(block: Blockly.Block) {
    const code = block.getFieldValue('TEXT') || '';
    return [JSON.stringify(code), Order.ATOMIC];
  },
};