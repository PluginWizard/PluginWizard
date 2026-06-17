import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java';

export default {
    block: 'set_entity',
    generator: function(block: Blockly.Block) {
        const entityId = block.getFieldValue('ID') || '1';
        const property = block.getFieldValue('PROPERTY') || 'null';
        const value = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || 'null';

        return `customEntity${entityId}.set${property}(${value});\n`;
    },
};
