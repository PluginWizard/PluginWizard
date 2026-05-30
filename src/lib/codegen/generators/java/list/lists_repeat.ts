import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'lists_repeat',
  generator: function(block: Blockly.Block) {
    const item = JavaGenerator.valueToCode(block, 'ITEM', Order.ATOMIC) || 'null';
    const num = JavaGenerator.valueToCode(block, 'NUM', Order.ATOMIC) || '0';
    const code = `new ArrayList<>(Collections.nCopies(${num}, ${item}))`;
    return [code, Order.ATOMIC];
  },
};