import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'text',
  generator: function(block: Blockly.Block) {
    const code = block.getFieldValue('TEXT') || '';
    return [JSON.stringify(code), Order.ATOMIC];
  },
};