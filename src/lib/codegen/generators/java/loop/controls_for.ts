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
    const by = JavaGenerator.valueToCode(block, 'BY', Order.ATOMIC) || '1';
    const doCode = JavaGenerator.statementToCode(block, 'DO');

    // Determine if ascending or descending based on the step value
    const byAbsValue = by.startsWith('-') ? by.substring(1) : by;
    const stepIsNegative = by.startsWith('-');
    
    let condition: string;
    let increment: string;
    
    if (stepIsNegative) {
        condition = `${variableName} >= ${to}`;
        increment = `${variableName} -= ${byAbsValue}`;
    } else {
        condition = `${variableName} <= ${to}`;
        increment = `${variableName} += ${by}`;
    }

    return `for (int ${variableName} = ${from}; ${condition}; ${increment}) {\n${indent(doCode)}}`;
  },
};