import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'logic_null',
  generator: function(block: Blockly.Block) {
    return ['null', Order.ATOMIC];
  },
};