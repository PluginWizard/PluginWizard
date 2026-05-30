import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
    block: 'world_gamerule',
    generator: function(block: Blockly.Block) {
        const world = JavaGenerator.valueToCode(block, 'WORLD', Order.ATOMIC) || 'null';
        const gamerule = JavaGenerator.valueToCode(block, 'GAMERULE', Order.ATOMIC) || 'null';
        const value = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || 'false';

        const boolValue = value === 'true' ? 'true' : 'false';

        return `${world}.setGameRule(${gamerule}, ${boolValue});\n`;
    }
}