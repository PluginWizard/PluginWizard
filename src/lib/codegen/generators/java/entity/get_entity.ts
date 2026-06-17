import * as Blockly from 'blockly';
import { Order } from '../../java';

export default {
    block: 'get_entity',
    generator: function(block: Blockly.Block) {
        const entityId = block.getFieldValue('ID') || '1';
        const property = block.getFieldValue('PROPERTY') || 'null';

        return [`customEntity${entityId}.get${property}()`, Order.ATOMIC];
    },
};
