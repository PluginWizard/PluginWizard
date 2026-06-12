import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java.js';

export default {
    block: 'set_block_type',
    generator: function(block: Blockly.Block) {
        const worldBlock = JavaGenerator.valueToCode(block, 'BLOCK', Order.ATOMIC) || 'null';
        const material = block.getFieldValue('TYPE') || 'grass_block';

        imports.add('import org.bukkit.Material;');

        return `${worldBlock}.setType(Material.${material.toUpperCase()});\n`;
    }
}