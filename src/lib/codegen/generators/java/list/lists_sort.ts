import * as Blockly from 'blockly';
import { imports, JavaGenerator, Order } from '../../java.js';

export default {
  block: 'lists_sort',
  generator: function(block: Blockly.Block) {
    imports.add('import java.util.Collections;');    
    const list = JavaGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || 'new ArrayList<>()';
    const direction = block.getFieldValue('DIRECTION') === '1' ? '' : 'Collections.reverseOrder()';
    const code = `Collections.sort(${list}${direction ? ', ' + direction : ''});`;
    return code + '\n';
  },
};