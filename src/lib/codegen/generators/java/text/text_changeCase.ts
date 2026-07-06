import * as Blockly from 'blockly';
import { imports, JavaGenerator, Order } from '../../java.js';

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
            // Use Pattern/Matcher to capitalize first letter of each word
            imports.add('import java.util.regex.Pattern;');
            code = `java.util.regex.Pattern.compile("\\\\b(\\\\w)(\\\\w*)").matcher(${text}.toLowerCase()).replaceAll(m -> m.group(1).toUpperCase() + m.group(2))`;
            break;
        default:
            throw new Error('Unknown case: ' + mode);
    }
    return [code, Order.ATOMIC];
  },
};