import * as Blockly from 'blockly';
import { Order } from '../../java.js';

export default {
    block: 'region_event_get',
    generator: function(block: Blockly.Block) {
        const selected = block.getFieldValue('EVENT_VALUE') || 'regionEvent';
        return [selected, Order.ATOMIC];
    }
}