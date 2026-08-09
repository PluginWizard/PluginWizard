import * as Blockly from 'blockly';
import { Order, imports } from '../../java.js';

export default {
    block: 'block_of',
    generator: function(block: Blockly.Block) {
        const material = block.getFieldValue('TYPE') || 'grass_block';

        imports.add('import org.bukkit.Material;');

        return [`Material.${material.toUpperCase()}`, Order.ATOMIC];
    }
}
