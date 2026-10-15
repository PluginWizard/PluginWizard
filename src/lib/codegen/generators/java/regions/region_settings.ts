import * as Blockly from 'blockly';
import { imports } from '../../java';

export default {
    block: 'region_settings',
    generator: function(block: Blockly.Block) {
        const regionName = block.getFieldValue('REGION') || 'region';
        const sanitizedName = regionName.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');
        const setting = block.getFieldValue('SETTING') || 'setting';
        const enabled = block.getFieldValue('ENABLED');

        imports.add(`import net.kalbskinder.helpers.regions.RegionFlag;`);

        if (enabled === 'TRUE') {
            return `Helpers.regionHelper.addRegionFlag(${sanitizedName}, RegionFlag.${setting});\n`;
        } else {
            return `Helpers.regionHelper.removeRegionFlag(${sanitizedName}, RegionFlag.${setting});\n`;
        }
    }
}
