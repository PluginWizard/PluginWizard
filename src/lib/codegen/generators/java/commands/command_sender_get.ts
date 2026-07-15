import * as Blockly from 'blockly';
import { Order } from '../../java.js';

export default {
    block: 'command_sender_get',
    generator: function(_block: Blockly.Block) {
        return ['ctx.getSender()', Order.ATOMIC];
    }
}