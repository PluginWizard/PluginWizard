import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
    block: 'get_world',
    generator: function(block: Blockly.Block) {
        const worldName = block.getFieldValue('WORLD');
        return [`Bukkit.getWorld("${worldName}")`, Order.ATOMIC];
    }
}