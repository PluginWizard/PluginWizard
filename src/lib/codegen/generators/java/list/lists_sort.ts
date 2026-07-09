import * as Blockly from 'blockly';
import { imports, JavaGenerator, Order } from '../../java.js';

export default {
  block: 'lists_sort',
  generator: function(block: Blockly.Block) {
    imports.add('import java.util.Collections;');
    imports.add('import java.util.Comparator;');    
    const list = JavaGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || 'new ArrayList<>';
    const type = block.getFieldValue('TYPE') || 'NUMERIC'; // NUMERIC, TEXT, or IGNORE_CASE
    const direction = block.getFieldValue('DIRECTION');
    
    let comparator = '';
    if (type === 'NUMERIC') {
        comparator = 'Comparator.comparingDouble(o -> ((Number) o).doubleValue())';
    } else if (type === 'TEXT') {
        comparator = 'Comparator.comparing(Object::toString)';
    } else if (type === 'IGNORE_CASE') {
        comparator = 'Comparator.comparing(o -> o.toString().toLowerCase())';
    } else {
        comparator = 'Comparator.comparingDouble(o -> ((Number) o).doubleValue())';
    }
    
    if (direction === '-1') {
        comparator = comparator + '.reversed()';
    }
    
    const code = `Collections.sort(${list}, ${comparator});`;
    return code + '\n';
  },
};