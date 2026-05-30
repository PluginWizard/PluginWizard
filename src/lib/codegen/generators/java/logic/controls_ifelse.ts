import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'controls_ifelse',
  generator: function(block: Blockly.Block) {
    const condition = JavaGenerator.valueToCode(block, 'IF0', Order.ATOMIC);
    const doCode = JavaGenerator.statementToCode(block, 'DO0');
    const elseCode = JavaGenerator.statementToCode(block, 'ELSE');
    const code = 'if (' + condition + ') {\n' + indent(doCode) + '} else {\n' + indent(elseCode) + '}\n';
    return code;
  },
};