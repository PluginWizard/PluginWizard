import * as Blockly from 'blockly';
import { Order } from '../../java.js';

export default {
  block: 'lists_create_empty',
  generator: function(_block: Blockly.Block) {
    return ['new ArrayList<>()', Order.ATOMIC];
  },
};