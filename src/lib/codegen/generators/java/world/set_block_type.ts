import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java.js';

export default {
    block: 'set_block_type',
    generator: function(block: Blockly.Block) {
        const location = JavaGenerator.valueToCode(block, 'LOCATION', Order.ATOMIC) || 'null';
        const material = JavaGenerator.valueToCode(block, 'TYPE', Order.ATOMIC) || 'Material.GRASS_BLOCK';

        imports.add('import org.bukkit.Material;');

        return `${location}.getBlock().setType(${material});\n`;
    }
}