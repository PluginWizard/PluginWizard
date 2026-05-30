import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent, imports, getWorldFromLocation } from '../../java.js';

export default {
    block: 'spawn_particle',
    generator: function(block: Blockly.Block) {
        const amount = JavaGenerator.valueToCode(block, 'AMOUNT', Order.ATOMIC) || '0';
        const particle = block.getFieldValue('PARTICLE').toUpperCase() || 'EXPLOSION_NORMAL';
        const location = JavaGenerator.valueToCode(block, 'LOCATION', Order.ATOMIC) || 'null';
        const world = getWorldFromLocation(location);

        imports.add('import org.bukkit.Particle;');

        return `Bukkit.getWorld("${world}").spawnParticle(Particle.${particle}, ${location}, ${amount});\n`;
    }
}