import * as Blockly from 'blockly';
import { imports } from '../../java';

export default {
    block: 'region_settings',
    generator: function(block: Blockly.Block) {
        const regionName = block.getFieldValue('REGION') || 'region';
        const regionNameLiteral = JSON.stringify(regionName);
        const setting = block.getFieldValue('SETTING') || 'setting';
        const enabled = block.getFieldValue('ENABLED');

        if (enabled === 'TRUE') {
            imports.add(`import net.kalbskinder.helpers.regions.RegionFlag;`);
            return `Helpers.regionHelper.addRegionFlag(${regionNameLiteral}, RegionFlag.${setting});\n`;
        } else {
            return `Helpers.regionHelper.removeRegionFlag(${regionNameLiteral}, RegionFlag.${setting});\n`;
        }
    }
}