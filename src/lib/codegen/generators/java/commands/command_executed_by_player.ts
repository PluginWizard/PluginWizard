import * as Blockly from 'blockly';
import { Order } from '../../java.js';

export default {
    block: 'command_executed_by_player',
    generator: function(_block: Blockly.Block) {
        return ['ctx.wasExecutedByPlayer()', Order.ATOMIC];
    }
}