import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'logic_boolean',
  generator: function(block: Blockly.Block) {
    const value = block.getFieldValue('BOOL') === 'TRUE';
    return [value ? 'true' : 'false', Order.ATOMIC];
  },
};