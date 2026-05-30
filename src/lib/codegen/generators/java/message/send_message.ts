import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'send_message',
  generator: function(block: Blockly.Block) {
    const message = JavaGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || '""';
    const target = JavaGenerator.valueToCode(block, 'TARGET', Order.ATOMIC) || 'player';
    return `Helpers.messageHelper.sendMessage(${target}, ${message});\n`;
  }
};
