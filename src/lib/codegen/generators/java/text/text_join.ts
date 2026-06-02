import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'text_join',
  generator: function(block: Blockly.Block) {
    const pieces = [];
    for (let i = 0; i < block.inputList.length; i++) {
        pieces.push(JavaGenerator.valueToCode(block, 'ADD' + i, Order.ATOMIC));
    }
    const code = 'String.join("", ' + pieces.join(', ') + ')';
    return [code, Order.ATOMIC];
  },
};