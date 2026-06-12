import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java.js';

export default {
    block: 'play_sound',
    generator: function(block: Blockly.Block) {
        const sound = block.getFieldValue('SOUND') || '';
        const volume = block.getFieldValue('VOLUME') || '1';
        const pitch = block.getFieldValue('PITCH') || '1';
        const target = JavaGenerator.valueToCode(block, 'TARGET', Order.ATOMIC) || 'player';
        
        imports.add('import org.bukkit.Sound;');

        return `Helpers.soundHelper.playSound(${target}, Sound.${sound}, ${volume}f, ${pitch}f);\n`;
    }
}