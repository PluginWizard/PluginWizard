import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
    block: 'in_region',
    generator: function(block: Blockly.Block) {
        const regionName = block.getFieldValue('REGION') || 'myRegion';
        const regionNameLiteral = JSON.stringify(regionName);
        const player = JavaGenerator.valueToCode(block, 'PLAYER', Order.ATOMIC) || 'player';

        return [`Helpers.regionHelper.isPlayerInRegion(${player}, ${regionNameLiteral})`, Order.ATOMIC];
    }
}