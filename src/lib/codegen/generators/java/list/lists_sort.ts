import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'lists_sort',
  generator: function(block: Blockly.Block) {
    const list = JavaGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || 'new ArrayList<>()';
    const direction = block.getFieldValue('DIRECTION') === '1' ? '' : 'Collections.reverseOrder()';
    const code = `Collections.sort(${list}${direction ? ', ' + direction : ''});`;
    return code + '\n';
  },
};