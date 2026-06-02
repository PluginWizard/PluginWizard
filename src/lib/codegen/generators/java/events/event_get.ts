import * as Blockly from 'blockly';
import { Order } from '../../java.js';

export default {
    block: 'event_get',
    generator: function(block: Blockly.Block) {
        const value = block.getFieldValue('VALUE') || 'event.getEventName()';
        return [value, Order.ATOMIC];
    }
}