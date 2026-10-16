import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'gui_set_item',
  generator: function(block: Blockly.Block) {
    const gui = JavaGenerator.valueToCode(block, 'GUI', Order.ATOMIC) || 'null';
    const slot = JavaGenerator.valueToCode(block, 'SLOT', Order.ATOMIC) || '0';
    const item = JavaGenerator.valueToCode(block, 'ITEM', Order.ATOMIC) || 'null';
    return `${gui}.setItemStack(${slot}, ${item});\n`;
  },
};
