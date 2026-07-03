import * as Blockly from 'blockly';
import { imports, JavaGenerator, Order } from '../../java.js';

export default {
    block: 'create_location',
    generator: function(block: Blockly.Block) {
        const x = JavaGenerator.valueToCode(block, 'X', Order.ATOMIC) || '0';
        const y = JavaGenerator.valueToCode(block, 'Y', Order.ATOMIC) || '0';
        const z = JavaGenerator.valueToCode(block, 'Z', Order.ATOMIC) || '0';
        let world = JavaGenerator.valueToCode(block, 'WORLD', Order.ATOMIC) || 'null';
        
        // Handle both World objects and String names
        let code: string;
        if (world.startsWith('"') && world.endsWith('"')) {
            const worldName = world.substring(1, world.length - 1);
            code = `Helpers.locationHelper.stringToLocation("${worldName},${x},${y},${z}")`;
        } else {
            imports.add('import org.bukkit.Location;');
            code = `new Location(${world}, ${x}, ${y}, ${z})`;
        }
        
        return [code, Order.ATOMIC];
    }
}