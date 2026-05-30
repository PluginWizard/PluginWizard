import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
    block: 'cancel_event',
    generator: function(block: Blockly.Block) {
        return 'event.setCancelled(true);\n';
    }
}