import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'variables_get',
  generator: function (block: Blockly.Block) {
    const varName = JavaGenerator.nameDB_?.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME) || 'var';
    return [varName, Order.ATOMIC];
  },
};
