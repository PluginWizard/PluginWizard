import * as Blockly from 'blockly';
import { imports, JavaGenerator, Order } from '../../java.js';

export default {
  block: 'lists_create_with',
  generator: function(block: Blockly.Block) {
    imports.add('import java.util.Arrays;');
    const elements = [];
    // Iterate only inputs named ADD* to avoid reading non-existent ADD indices
    const addInputs = block.inputList.filter((input) => input.name.startsWith('ADD'));
    for (let i = 0; i < addInputs.length; i++) {
        const elementCode = JavaGenerator.valueToCode(block, 'ADD' + i, Order.ATOMIC) || 'null';
        elements.push(elementCode);
    }
    // Use mutable ArrayList instead of immutable List.of()
    const code = `new ArrayList<>(Arrays.asList(${elements.join(', ')}))`;
    return [code, Order.ATOMIC];
  },
};