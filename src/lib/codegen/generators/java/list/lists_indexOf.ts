import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'lists_indexOf',
  generator: function(block: Blockly.Block) {
    const find = JavaGenerator.valueToCode(block, 'FIND', Order.ATOMIC) || 'null';
    const list = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || 'new ArrayList<>()';
    const indexCode = block.getFieldValue('END') === 'FIRST'
        ? `${list}.indexOf(${find}) + 1`
        : `${list}.lastIndexOf(${find}) + 1`;
    return [indexCode, Order.ATOMIC];
  },
};