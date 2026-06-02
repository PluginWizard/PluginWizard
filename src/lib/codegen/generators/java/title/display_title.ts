import { JavaGenerator, Order } from '../../java.js';
import * as Blockly from 'blockly';

export default {
    block: 'display_title',
    generator: function(block: Blockly.Block) {
        const text = JavaGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || '""';
        const fadeIn = block.getFieldValue('FADE_IN') || '0';
        const stay = block.getFieldValue('STAY') || '0';
        const fadeOut = block.getFieldValue('FADE_OUT') || '0';
        const target = JavaGenerator.valueToCode(block, 'TARGET', Order.ATOMIC) || 'player';

        return `Helpers.titleHelper.displayTitle(${target}, ${text}, ${parseInt(fadeIn)}, ${parseInt(stay)}, ${parseInt(fadeOut)});\n`;
    }
}