import * as Blockly from 'blockly';
import { imports, Order } from '../../java';

export default {
  block: 'player_game_modes',
  generator: function(block: Blockly.Block) {
    const gameMode = block.getFieldValue('GAME_MODE') || 'SURVIVAL';
    imports.add('import org.bukkit.GameMode;');
    return [`GameMode.${gameMode}`, Order.ATOMIC];
  }
};
