import * as Blockly from 'blockly';
import { Order } from '../../java.js';
import { javaIdentifier } from './function_utils.js';

export default {
  block: 'function_parameter_get',
  generator: function(block: Blockly.Block) {
    return [javaIdentifier(block.getFieldValue('NAME'), 'value'), Order.ATOMIC];
  },
};
