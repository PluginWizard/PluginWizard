import { JavaGenerator, Order, indent } from '../../java.js';
import * as Blockly from 'blockly';

export default {
    block: 'display_subtitle',
    generator: function(block: Blockly.Block) {
        const text = JavaGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || '""';
        const target = JavaGenerator.valueToCode(block, 'TARGET', Order.ATOMIC) || 'player';
        const fadeIn = block.getFieldValue('FADE_IN') || '0';
        const stay = block.getFieldValue('STAY') || '0';
        const fadeOut = block.getFieldValue('FADE_OUT') || '0';

        return `Helpers.titleHelper.displayTitle(${target}, "", ${text}, ${parseInt(fadeIn)}, ${parseInt(stay)}, ${parseInt(fadeOut)});\n`;
    }
}