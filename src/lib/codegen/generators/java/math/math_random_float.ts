import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'math_random_float',
  generator: function(block: Blockly.Block) {
    return ['Math.random()', Order.ATOMIC];
  },
};