import * as Blockly from 'blockly';
import { imports, JavaGenerator, Order } from '../../java.js';

export default {
  block: 'lists_reverse',
  generator: function(block: Blockly.Block) {
    imports.add('import java.util.Collections;');    
    const list = JavaGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || 'new ArrayList<>()';
    return `Collections.reverse(${list});\n`;
  },
};