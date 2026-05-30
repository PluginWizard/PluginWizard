import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'call_function',
  generator: function(block: Blockly.Block) {
    const name = block.getFieldValue('NAME') || 'myFunction';
    return [`${name}()`, Order.ATOMIC];
  },
};