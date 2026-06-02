import * as Blockly from 'blockly';
import { Order } from '../../java.js';

export default {
  block: 'math_random_float',
  generator: function(block: Blockly.Block) {
    return ['Math.random()', Order.ATOMIC];
  },
};