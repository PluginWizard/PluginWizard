import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'controls_forEach',
  generator: function(block: Blockly.Block) {
    const variable = JavaGenerator.nameDB_?.getName(block.getFieldValue('VAR'), Blockly.Names.NameType.VARIABLE);
    const list = JavaGenerator.valueToCode(block, 'LIST', Order.ATOMIC);
    const doCode = JavaGenerator.statementToCode(block, 'DO');
    const code = `for (var ${variable} : ${list}) {\n${indent(doCode)}}\n`;
    return code;
  },
};