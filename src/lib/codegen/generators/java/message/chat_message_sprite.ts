import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'chat_message_sprite',
  generator: function(block: Blockly.Block) {
    const sprite = block.getFieldValue('SPRITE') || '';
    const code = '"<sprite:' + sprite + '>"';
    return [code, Order.ATOMIC];
  }
};
