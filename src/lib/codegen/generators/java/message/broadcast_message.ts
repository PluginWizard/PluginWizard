import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'broadcast_message',
  generator: function(block: Blockly.Block) {
    const message = JavaGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || '""';
    return `Bukkit.getServer().getOnlinePlayers().forEach(player -> player.sendMessage(Helpers.miniMessageHelper.parse(${message})));\n`
  }
};
