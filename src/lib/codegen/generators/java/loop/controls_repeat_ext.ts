import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'controls_repeat_ext',
  generator: function(block: Blockly.Block) {
    const times = JavaGenerator.valueToCode(block, 'TIMES', Order.ATOMIC);
    const doCode = JavaGenerator.statementToCode(block, 'DO');
    const loopVar = JavaGenerator.nameDB_?.getDistinctName('i', Blockly.Names.NameType.VARIABLE);
    const code = 'for (int ' + loopVar + ' = 0; ' + loopVar + ' < ' + times + '; ' + loopVar + '++) {\n' + indent(doCode) + '}';
    return code;
  },
};