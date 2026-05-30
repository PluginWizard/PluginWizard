import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'controls_for',
  generator: function(block: Blockly.Block) {
    const variableName = JavaGenerator.nameDB_?.getName(
        block.getFieldValue('VAR'),
        Blockly.Names.NameType.VARIABLE
    );

    const from = JavaGenerator.valueToCode(block, 'FROM', Order.ATOMIC) || '0';
    const to = JavaGenerator.valueToCode(block, 'TO', Order.ATOMIC) || '0';
    const doCode = JavaGenerator.statementToCode(block, 'DO');

    return `for (int ${variableName} = ${from}; ${variableName} <= ${to}; ${variableName}++) {\n${indent(doCode)}}`;
  },
};