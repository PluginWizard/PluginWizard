import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
    block: 'location_get_block',
    generator: function(block: Blockly.Block) {
        const location = JavaGenerator.valueToCode(block, 'LOCATION', Order.ATOMIC) || 'null';

        return [`(${location}).getBlock()`, Order.ATOMIC];
    }
}