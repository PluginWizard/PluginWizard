import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java.js';

export default {
  block: 'give_item',
  generator: function(block: Blockly.Block) {
    const item = JavaGenerator.valueToCode(block, 'ITEM', Order.ATOMIC) || 'null';
    const amount = JavaGenerator.valueToCode(block, 'AMOUNT', Order.ATOMIC) || '1';
    const receiver = JavaGenerator.valueToCode(block, 'RECEIVER', Order.ATOMIC) || 'null';

    const code = `Helpers.playerItemHelper.giveItem(${item}, ${amount}, ${receiver});\n`;

    imports.add('import org.bukkit.Material;');

    return code;
  },
};