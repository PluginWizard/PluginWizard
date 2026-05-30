import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'lists_create_with',
  generator: function(block: Blockly.Block) {
    const elements = [];
    for (let i = 0; i < block.inputList.length; i++) {
        const elementCode = JavaGenerator.valueToCode(block, 'ADD' + i, Order.ATOMIC) || 'null';
        elements.push(elementCode);
    }
    const code = `List.of(${elements.join(', ')})`;
    return [code, Order.ATOMIC];
  },
};