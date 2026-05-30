import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
    block: 'get_world_time',
    generator: function(block: Blockly.Block) {
        const world = JavaGenerator.valueToCode(block, 'WORLD', Order.ATOMIC) || 'null';
        return [`${world}.getTime()`, Order.ATOMIC];
    }
}