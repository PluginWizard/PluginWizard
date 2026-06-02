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
        code = `${list}.remove(${index} - 1);`;
        return code + '\n';
    } else if (mode === 'GET_REMOVE') {
        code = `${list}.remove(${index} - 1)`;
        return [code, Order.ATOMIC];
    }
    return '';
  },
};