import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'player_methods',
  generator: function(block: Blockly.Block) {
    const method = block.getFieldValue('METHOD');
    const arg = JavaGenerator.valueToCode(block, 'ARG', Order.ATOMIC) || 'null';
    const player = JavaGenerator.valueToCode(block, 'PLAYER', Order.ATOMIC) || 'player';
    return [`${player}.${method}(${arg})`, Order.ATOMIC];
  }
};
