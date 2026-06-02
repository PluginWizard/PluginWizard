import * as Blockly from 'blockly';
import { JavaGenerator, Order, getWorldFromLocation } from '../../java.js';

export default {
    block: 'location_get_block',
    generator: function(block: Blockly.Block) {
        const location = JavaGenerator.valueToCode(block, 'LOCATION', Order.ATOMIC) || 'null';
        const world = getWorldFromLocation(location);

        return [`Bukkit.getWorld("${world}").getBlockAt(${location})`, Order.ATOMIC];
    }
}