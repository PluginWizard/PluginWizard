import * as Blockly from 'blockly';
import { Order } from '../../java';

export default {
  block: 'player_game_modes',
  generator: function(block: Blockly.Block) {
    const gameMode = block.getFieldValue('GAME_MODE') || 'SURVIVAL';
    return [`GameMode.${gameMode}`, Order.ATOMIC];
  }
};
