import * as Blockly from 'blockly';
import { JavaGenerator, pluginRegionEvents, indent } from '../../java.js';

export default {
    block: 'region_events',
    generator: function(block: Blockly.Block) {
        const regionName = block.getFieldValue('REGION') || 'myRegion';
        const sanitizedName = regionName.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');
        const eventType = block.getFieldValue('PLAYER_EVENT') || 'onRegionEnter';
        const execute = JavaGenerator.statementToCode(block, 'DO');

        pluginRegionEvents.push(`${sanitizedName}.${eventType}(regionEvent -> {\n${indent(execute)}});\nHelpers.regionHelper.addRegion(${sanitizedName});\n`);
        return '';
    }
}