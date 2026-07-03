import * as Blockly from 'blockly';
import { imports, JavaGenerator, Order } from '../../java.js';

export default {
  block: 'lists_split',
  generator: function(block: Blockly.Block) {
    imports.add('import java.util.Arrays;');
    const input = JavaGenerator.valueToCode(block, 'INPUT', Order.ATOMIC) || '""';
    const delim = JavaGenerator.valueToCode(block, 'DELIM', Order.ATOMIC) || '","';
    const mode = block.getFieldValue('MODE');
    let code;
    if (mode === 'SPLIT') {
        code = `new ArrayList<>(Arrays.asList(${input}.split(${delim})))`;
    } else if (mode === 'JOIN') {
        code = `String.join(${delim}, ${input})`;
    } else {
        code = '""';
    }
    return [code, Order.ATOMIC];
  },
};