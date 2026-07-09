import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'text_join',
  generator: function(block: Blockly.Block) {
    const pieces = [];
    for (let i = 0; i < block.inputList.length; i++) {
        const inputName = 'ADD' + i;
        if (block.getInput(inputName)) {
            pieces.push(JavaGenerator.valueToCode(block, inputName, Order.ATOMIC));
        }
    }
    
    let code: string;
    if (pieces.length === 0) {
        code = '""';
    } else {
        code = 'String.join("", ' + pieces.join(', ') + ')';
    }
    return [code, Order.ATOMIC];
  },
};