import * as Blockly from 'blockly';
import { Order } from '../../java.js';
import { functionCallCode } from './function_utils.js';

export default {
  block: 'call_function_params',
  generator: function(block: Blockly.Block) {
    return [functionCallCode(block), Order.ATOMIC];
  },
};
