import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'gui_remove_click',
  generator: function(block: Blockly.Block) {
    const gui = JavaGenerator.valueToCode(block, 'GUI', Order.ATOMIC) || 'null';
    const slot = JavaGenerator.valueToCode(block, 'SLOT', Order.ATOMIC) || '0';
    return `${gui}.removeClick(${slot});\n`;
  },
};
