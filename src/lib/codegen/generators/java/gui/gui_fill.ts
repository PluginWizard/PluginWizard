import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'gui_fill',
  generator: function(block: Blockly.Block) {
    const gui = JavaGenerator.valueToCode(block, 'GUI', Order.ATOMIC) || 'null';
    const method = block.getFieldValue('AREA') || 'setBackground';
    const item = JavaGenerator.valueToCode(block, 'ITEM', Order.ATOMIC) || 'null';
    return `${gui}.${method}(${item});\n`;
  },
};
