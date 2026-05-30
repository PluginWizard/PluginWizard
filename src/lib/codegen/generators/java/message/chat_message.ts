import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default{
  block: 'chat_message',
  generator: function(block: Blockly.Block) {
    const message = JavaGenerator.valueToCode(block, 'MESSAGE', Order.ATOMIC) || '""';
    const colour = block.getFieldValue('COLOUR');
    const code = '"<color:' + colour + '>" + ' + message;
    return [code, Order.ATOMIC];
  },
};