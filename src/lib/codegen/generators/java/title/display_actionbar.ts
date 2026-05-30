import { JavaGenerator, Order, indent } from '../../java.js';
import * as Blockly from 'blockly';

export default {
    block: 'display_actionbar',
    generator: function(block: Blockly.Block) {
        const text = JavaGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || '""';
        const target = JavaGenerator.valueToCode(block, 'TARGET', Order.ATOMIC) || 'player';

        return `Helpers.titleHelper.displayActionbar(${target}, ${text});\n`;
    }
}