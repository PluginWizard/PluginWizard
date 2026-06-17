import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java';

export default {
    block: 'create_entity',
    generator: function(block: Blockly.Block) {
        const entity = block.getFieldValue('ENTITY') || 'minecraft:pig';
        const customId = block.getFieldValue('ID') || '1';
        const world = JavaGenerator.valueToCode(block, 'WORLD', Order.ATOMIC);

        imports.add('org.bukkit.entity.Entity;');

        return `Entity customEntity${customId} = Helpers.entityHelper.summonEntity("${entity}", "${customId}", ${world});\n`;
    },
};
