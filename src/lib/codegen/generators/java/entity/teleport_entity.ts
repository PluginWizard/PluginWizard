import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java';

export default {
    block: 'teleport_entity',
    generator: function(block: Blockly.Block) {
        const customId = block.getFieldValue('ID') || '1';
        const stringLocation = JavaGenerator.valueToCode(block, 'LOCATION', Order.ATOMIC) || 'null';

        return `customEntity${customId}.teleport(Helpers.locationHelper.stringToLocation(${stringLocation}));\n`;
    },
};
