import { JavaGenerator, Order, imports } from '../../java.js';
import * as Blockly from 'blockly';

export default {
    block: 'play_sound_at',
    generator: function(block: Blockly.Block) {
        const sound = block.getFieldValue('SOUND') || 'AMBIENT_CAVE';
        const volume = block.getFieldValue('VOLUME') || '1';
        const pitch = block.getFieldValue('PITCH') || '1';
        const location = JavaGenerator.valueToCode(block, 'LOCATION', Order.ATOMIC) || 'null';

        imports.add('import org.bukkit.Sound;');

        return `Helpers.soundHelper.playSound(${location}, Sound.${sound}, ${volume}f, ${pitch}f);\n`;
    }
}