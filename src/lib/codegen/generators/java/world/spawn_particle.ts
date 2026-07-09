import * as Blockly from 'blockly';
import { JavaGenerator, Order, imports } from '../../java.js';

export default {
    block: 'spawn_particle',
    generator: function(block: Blockly.Block) {
        const amount = JavaGenerator.valueToCode(block, 'AMOUNT', Order.ATOMIC) || '0';
        const particle = block.getFieldValue('PARTICLE').toUpperCase() || 'EXPLOSION';
        const location = JavaGenerator.valueToCode(block, 'LOCATION', Order.ATOMIC) || 'null';

        imports.add('import org.bukkit.Particle;');

        return `(${location}).getWorld().spawnParticle(Particle.${particle}, ${location}, ${amount});\n`;
    }
}