import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';
import { clickLambda } from './gui_utils.js';

export default {
  block: 'gui_set_item_click',
  generator: function(block: Blockly.Block) {
    const gui = JavaGenerator.valueToCode(block, 'GUI', Order.ATOMIC) || 'null';
    const slot = JavaGenerator.valueToCode(block, 'SLOT', Order.ATOMIC) || '0';
    const item = JavaGenerator.valueToCode(block, 'ITEM', Order.ATOMIC) || 'null';
    return `${gui}.setItem(${slot}, ${item}, ${clickLambda(block)});\n`;
  },
};
