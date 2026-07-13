import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java.js';

export default {
    block: 'region_create',
    generator: function(block: Blockly.Block) {
        const regionName = block.getFieldValue('REGION_NAME') || 'region';
        const sanitizedName = regionName.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');
        const loc1 = JavaGenerator.valueToCode(block, 'POS1', Order.ATOMIC) || 'null';
        const loc2 = JavaGenerator.valueToCode(block, 'POS2', Order.ATOMIC) || 'null';


        imports.add("import net.kalbskinder.helpers.regions.Region;");
        imports.add("import java.util.UUID;");


        return `Region ${sanitizedName} = new Region(UUID.randomUUID(), "${regionName}", ${loc1}, ${loc2});\nHelpers.regionHelper.addRegion(${sanitizedName});\n`;
    }
}