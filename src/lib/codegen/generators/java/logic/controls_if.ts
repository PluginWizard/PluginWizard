import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'controls_if',
  generator: function(block: Blockly.Block) {
    let code = '';
    
    // Handle the initial IF block
    const condition0 = JavaGenerator.valueToCode(block, 'IF0', Order.ATOMIC);
    const do0 = JavaGenerator.statementToCode(block, 'DO0');
    code += `if (${condition0}) {\n${indent(do0)}}\n`;
    
    // Handle ELSEIF blocks
    const elseifCount = block.elseifCount_ || 0;
    for (let i = 1; i <= elseifCount; i++) {
      const condition = JavaGenerator.valueToCode(block, `IF${i}`, Order.ATOMIC);
      const doCode = JavaGenerator.statementToCode(block, `DO${i}`);
      code += `else if (${condition}) {\n${indent(doCode)}}\n`;
    }
    
    // Handle ELSE block
    const elseCount = block.elseCount_ || 0;
    if (elseCount > 0) {
      const elseCode = JavaGenerator.statementToCode(block, 'ELSE');
      code += `else {\n${indent(elseCode)}}\n`;
    }
    
    return code;
  },
};