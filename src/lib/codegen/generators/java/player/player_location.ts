import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'player_location',
  generator: function(block: Blockly.Block) {
    const method = block.getFieldValue('METHOD');
    const player = JavaGenerator.valueToCode(block, 'PLAYER', Order.ATOMIC) || 'player';
    return [`${player}.getLocation().${method}()`, Order.ATOMIC];
  }
};
