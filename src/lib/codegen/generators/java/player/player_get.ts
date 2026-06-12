import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'player_get',
  generator: function(block: Blockly.Block) {
    const property = block.getFieldValue('GET');
    const player = JavaGenerator.valueToCode(block, 'PLAYER', Order.ATOMIC) || 'player';
    return [`${player}.${property}()`, Order.ATOMIC];
  }
};
