import * as Blockly from 'blockly';
import { JavaGenerator, pluginRegionEvents, indent } from '../../java.js';

export default {
    block: 'region_events',
    generator: function(block: Blockly.Block) {
        const regionName = block.getFieldValue('REGION') || 'myRegion';
        const eventType = block.getFieldValue('PLAYER_EVENT') || 'onRegionEnter';
        const execute = JavaGenerator.statementToCode(block, 'DO');

        pluginRegionEvents.push(`${regionName}.${eventType}(regionEvent -> {\n${indent(execute)}});\nHelpers.regionHelper.addRegion(${regionName});\n`);
        return '';
    }
}