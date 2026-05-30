import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'return_of_function',
  generator: function(block: Blockly.Block) {
    const value = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || '';
    return `return ${value};\n`;
  },
};