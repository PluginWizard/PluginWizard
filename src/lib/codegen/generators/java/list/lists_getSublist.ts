import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'lists_getSublist',
  generator: function(block: Blockly.Block) {
    const list = JavaGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || 'new ArrayList<>()';
    const at1 = JavaGenerator.valueToCode(block, 'AT1', Order.ATOMIC) || '1';
    const at2 = JavaGenerator.valueToCode(block, 'AT2', Order.ATOMIC) || '1';
    const code = `${list}.subList(${at1} - 1, ${at2})`;
    return [code, Order.ATOMIC];
  },
};