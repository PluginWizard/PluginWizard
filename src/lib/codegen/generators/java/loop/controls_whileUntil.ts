import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'controls_whileUntil',
  generator: function(block: Blockly.Block) {
    const condition = JavaGenerator.valueToCode(block, 'BOOL', Order.ATOMIC);
      const doCode = JavaGenerator.statementToCode(block, 'DO');
      const mode = block.getFieldValue('MODE');
      let code;
  
      if (mode === 'WHILE') {
          code = 'while (' + condition + ') {\n' + indent(doCode) + '}\n';
      } else {
          code = 'do {\n' + indent(doCode) + '} while (!' + condition + ');\n';
      }
      return code;
  },
};