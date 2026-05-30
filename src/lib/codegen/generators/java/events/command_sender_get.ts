import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
    block: 'command_sender_get',
    generator: function(block: Blockly.Block) {
        return ['ctx.getSender()', Order.ATOMIC];
    }
}