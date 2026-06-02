import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java.js';

export default {
    block: 'region_create',
    generator: function(block: Blockly.Block) {
        const regionName = block.getFieldValue('REGION_NAME');
        const loc1 = JavaGenerator.valueToCode(block, 'POS1', Order.ATOMIC) || 'null';
        const loc2 = JavaGenerator.valueToCode(block, 'POS2', Order.ATOMIC) || 'null';


        imports.add("import net.kalbskinder.plugin.helpers.regions.Region;");
        imports.add("import java.util.UUID;");


        return `Region ${regionName} = new Region(UUID.randomUUID(), "${regionName}", ${loc1}, ${loc2});\nHelpers.regionHelper.addRegion(${regionName});\n`;
    }
}