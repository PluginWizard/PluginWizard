import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
    block: 'in_region',
    generator: function(block: Blockly.Block) {
        const regionName = block.getFieldValue('REGION') || 'myRegion';
        const player = JavaGenerator.valueToCode(block, 'PLAYER', Order.ATOMIC) || 'player';

        return [`Helpers.regionHelper.isPlayerInRegion(${player}, ${regionName})`, Order.ATOMIC];
    }
}