import * as Blockly from 'blockly';
import { Order } from '../../java.js';

export default {
  block: 'player',
  generator: function(_block: Blockly.Block) {
    return ['player', Order.ATOMIC];
  }
};
