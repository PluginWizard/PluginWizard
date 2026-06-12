import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'player_set',
  generator: function(block: Blockly.Block) {
    const property = block.getFieldValue('SET');
    const value = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || 'null';
    const player = JavaGenerator.valueToCode(block, 'PLAYER', Order.ATOMIC) || 'player';
    return `${player}.${property}(${value});\n`;
  }
};
