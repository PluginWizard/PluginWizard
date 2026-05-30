import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent, getDefaultValueForType } from '../../java.js';

export default {
  block: 'variables_declare',
  generator: function(block: Blockly.Block) {    
    const type = block.getFieldValue('TYPE') || 'Object';
    const varName = JavaGenerator.nameDB_?.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME) || 'var';
    const valueCode = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || getDefaultValueForType(type);
    return `${type} ${varName} = ${valueCode};\n`;
  },
};