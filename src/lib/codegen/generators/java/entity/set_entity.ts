import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java';

export default {
    block: 'set_entity',
    generator: function(block: Blockly.Block) {
        const entityId = block.getFieldValue('ID') || '1';
        const sanitizedId = entityId.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');
        const property = block.getFieldValue('PROPERTY') || 'null';
        const value = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || 'null';

        return `customEntity${sanitizedId}.set${property}(${value});\n`;
    },
};
