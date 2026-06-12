import * as Blockly from 'blockly';

export default {
    block: 'region_settings',
    generator: function(block: Blockly.Block) {
        const regionName = block.getFieldValue('REGION') || 'region';
        const setting = block.getFieldValue('SETTING') || 'setting';
        const enabled = block.getFieldValue('ENABLED');

        if (enabled === 'TRUE') {
            return `Helpers.regionHelper.addRegionFlag(${regionName}, RegionFlag.${setting});\n`;
        } else {
            return `Helpers.regionHelper.removeRegionFlag(${regionName}, RegionFlag.${setting});\n`;
        }
    }
}