import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
    block: 'world_gamerule',
    generator: function(block: Blockly.Block) {
        const world = JavaGenerator.valueToCode(block, 'WORLD', Order.ATOMIC) || 'null';
        const gamerule = JavaGenerator.valueToCode(block, 'GAMERULE', Order.ATOMIC) || 'null';
        const value = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || 'false';

        return `${world}.setGameRule(${gamerule}, ${value});\n`;
    }
}