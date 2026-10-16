import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'gui_get',
  generator: function(block: Blockly.Block) {
    const value = block.getFieldValue('VALUE') || 'getSize()';
    const gui = JavaGenerator.valueToCode(block, 'GUI', Order.ATOMIC) || 'null';
    return [`${gui}.${value}`, Order.ATOMIC];
  },
};
