import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'gui_open',
  generator: function(block: Blockly.Block) {
    const gui = JavaGenerator.valueToCode(block, 'GUI', Order.ATOMIC) || 'null';
    const player = JavaGenerator.valueToCode(block, 'PLAYER', Order.ATOMIC) || 'null';
    return `${gui}.open(${player});\n`;
  },
};
