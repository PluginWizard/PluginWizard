import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'text_changeCase',
  generator: function(block: Blockly.Block) {
    const text = JavaGenerator.valueToCode(block, 'TEXT', Order.ATOMIC);
    const mode = block.getFieldValue('CASE');
    let code;

    switch (mode) {
        case 'UPPERCASE':
            code = text + '.toUpperCase()';
            break;
        case 'LOWERCASE':
            code = text + '.toLowerCase()';
            break;
        case 'TITLECASE':
            // Capitalize first letter of each word
            code = `${text}.replaceAll("([A-Za-z])([A-Za-z]*)", m -> m.group(1).toUpperCase() + m.group(2).toLowerCase())`;
            break;
        default:
            throw new Error('Unknown case: ' + mode);
    }
    return [code, Order.ATOMIC];
  },
};