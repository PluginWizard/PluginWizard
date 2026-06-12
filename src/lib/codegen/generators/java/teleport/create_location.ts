import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
    block: 'create_location',
    generator: function(block: Blockly.Block) {
        const x = JavaGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
        const y = JavaGenerator.valueToCode(block, 'Y', Order.ATOMIC) || '0';
        const z = JavaGenerator.valueToCode(block, 'Z', Order.ATOMIC) || '0';
        const world = JavaGenerator.valueToCode(block, 'WORLD', Order.ATOMIC) || 'null';
        return [`Helpers.locationHelper.stringToLocation("${world.substring(1, world.length - 1)},${x},${y},${z}")`, Order.ATOMIC];
    }
}