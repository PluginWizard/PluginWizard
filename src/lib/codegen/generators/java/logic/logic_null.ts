import * as Blockly from 'blockly';
import { Order } from '../../java.js';

export default {
  block: 'logic_null',
  generator: function(_block: Blockly.Block) {
    return ['null', Order.ATOMIC];
  },
};