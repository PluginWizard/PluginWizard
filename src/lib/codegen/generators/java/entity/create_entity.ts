import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java';

export default {
    block: 'create_entity',
    generator: function(block: Blockly.Block) {
        const entity = block.getFieldValue('ENTITY') || 'minecraft:pig';
        const customId = block.getFieldValue('ID') || '1';
        const sanitizedId = customId.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');
        const world = JavaGenerator.valueToCode(block, 'WORLD', Order.ATOMIC) || 'null';

        imports.add('import org.bukkit.entity.Entity;');

        return `Entity customEntity${sanitizedId} = Helpers.entityHelper.summonEntity("${entity}", "${customId}", ${world});\n`;
    },
};
