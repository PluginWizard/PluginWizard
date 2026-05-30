import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'text_trim',
  generator: function(block: Blockly.Block) {
    const text = JavaGenerator.valueToCode(block, 'TEXT', Order.ATOMIC);
    const mode = block.getFieldValue('MODE');
    let code;

    switch (mode) {
        case 'LEFT':
            // Remove leading whitespace only
            code = `${text}.replaceAll("^\\\\s+", "")`;
            break;
        case 'RIGHT':
            // Remove trailing whitespace only
            code = `${text}.replaceAll("\\\\s+$", "")`;
            break;
        case 'BOTH':
            code = `${text}.trim()`;
            break;
        default:
            throw new Error('Unknown trim mode: ' + mode);
    }
    return [code, Order.ATOMIC];
  },
};