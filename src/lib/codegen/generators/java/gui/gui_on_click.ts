import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';
import { clickLambda } from './gui_utils.js';

export default {
  block: 'gui_on_click',
  generator: function(block: Blockly.Block) {
    const gui = JavaGenerator.valueToCode(block, 'GUI', Order.ATOMIC) || 'null';
    const slot = JavaGenerator.valueToCode(block, 'SLOT', Order.ATOMIC) || '0';
    return `${gui}.onClick(${slot}, ${clickLambda(block)});\n`;
  },
};
