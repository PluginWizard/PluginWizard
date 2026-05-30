import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'controls_repeat_ext',
  generator: function(block: Blockly.Block) {
    const times = JavaGenerator.valueToCode(block, 'TIMES', Order.ATOMIC);
    const doCode = JavaGenerator.statementToCode(block, 'DO');
    const code = 'for (int i = 0; i < ' + times + '; i++) {\n' + indent(doCode) + '}';
    return code;
  },
};