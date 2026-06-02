import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'variables_set',
  generator: function(block: Blockly.Block) {
    const varName = JavaGenerator.nameDB_?.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME) || 'x';
    const value = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || 'null';
    return `${varName} = ${value};\n`;

  },
};