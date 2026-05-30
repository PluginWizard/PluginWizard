import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports, indent } from '../../java.js';

export default {
    block: 'gamerule',
    generator: function(block: Blockly.Block) {
        const gamerule = block.getFieldValue('GAMERULE').toUpperCase();
        imports.add('import org.bukkit.GameRules;');

        return [`GameRules.${gamerule}`, Order.ATOMIC];
    }
}