import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'lists_getIndex',
  generator: function(block: Blockly.Block) {
    const list = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || 'new ArrayList<>()';
    const index = JavaGenerator.valueToCode(block, 'AT', Order.ATOMIC) || '1';
    const mode = block.getFieldValue('MODE'); // GET oder REMOVE
    let code;

    if (mode === 'GET') {
      code = `${list}.get(${index} - 1)`;
      return [code, Order.ATOMIC];
    } else if (mode === 'REMOVE') {
      code = `${list}.remove(${index} - 1)`;

      // lists_getIndex is used as both a value and statement block.
      // Return the correct shape depending on whether an output exists.
      if (block.outputConnection) {
        return [code, Order.ATOMIC];
      }
      return `${code};\n`;
    } else if (mode === 'GET_REMOVE') {
      code = `${list}.remove(${index} - 1)`;
      return [code, Order.ATOMIC];
    }
    return '';
  },
};