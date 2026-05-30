import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
    block: 'world_time',
    generator: function(block: Blockly.Block) {
        const world = JavaGenerator.valueToCode(block, 'WORLD', Order.ATOMIC) || 'null';
        const time = JavaGenerator.valueToCode(block, 'TIME', Order.ATOMIC) || '0';
        return `${world}.setTime(${time});\n`;
    }
}