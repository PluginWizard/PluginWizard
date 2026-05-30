import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'text_charAt',
  generator: function(block: Blockly.Block) {
    const text = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC);
    // Only get index if it exists (FROM_START, FROM_END)
    let index: string | undefined = undefined;
    const mode = block.getFieldValue('WHERE');

    if (mode === 'FROM_START' || mode === 'FROM_END') {
        index = JavaGenerator.valueToCode(block, 'AT', Order.ATOMIC);
    }

    let code: string;
    switch (mode) {
        case 'FROM_START':
            // Blockly uses 1-based index, Java uses 0-based
            code = `${text}.charAt(${index} - 1)`;
            break;
        case 'FROM_END':
            code = `${text}.charAt(${text}.length() - ${index})`;
            break;
        case 'FIRST':
            code = `${text}.charAt(0)`;
            break;
        case 'LAST':
            code = `${text}.charAt(${text}.length() - 1)`;
            break;
        case 'RANDOM':
            code = `${text}.charAt((int)(Math.random() * ${text}.length()))`;
            break;
        default:
            code = `${text}.charAt(${index})`;
    }
    return [code, Order.ATOMIC];
  },
};