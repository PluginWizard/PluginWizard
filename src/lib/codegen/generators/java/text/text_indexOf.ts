import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'text_indexOf',
  generator: function(block: Blockly.Block) {
    const text = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC);
    const substring = JavaGenerator.valueToCode(block, 'FIND', Order.ATOMIC);
    const end = block.getFieldValue('END');
    let code;

    if (end === 'FIRST') {
        code = text + '.indexOf(' + substring + ')';
    } else {
        code = text + '.lastIndexOf(' + substring + ')';
    }
    return [code, Order.ATOMIC];
  },
};