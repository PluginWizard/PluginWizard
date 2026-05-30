import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'teleport_player',
  generator: function(block: Blockly.Block) {
    const player = JavaGenerator.valueToCode(block, "PLAYER", Order.ATOMIC);
    const x = JavaGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
    const y = JavaGenerator.valueToCode(block, 'Y', Order.ATOMIC) || '64';
    const z = JavaGenerator.valueToCode(block, 'Z', Order.ATOMIC) || '0';
    const code = `teleportPlayerHelper.teleportEntity(${player}, ${x}, ${y}, ${z});\n`;
    return code;
  },
};