import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'teleport_player_location',
  generator: function(block: Blockly.Block) {
    const player = JavaGenerator.valueToCode(block, 'PLAYER', Order.ATOMIC);
    const location = JavaGenerator.valueToCode(block, 'LOCATION', Order.ATOMIC);
    const code = `teleportPlayerHelper.teleportEntity(${player}, ${location});\n`;
    return code;
  },
};
