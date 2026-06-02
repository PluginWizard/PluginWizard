import * as Blockly from 'blockly';

export default {
    block: 'cancel_event',
    generator: function(block: Blockly.Block) {
        return 'event.setCancelled(true);\n';
    }
}