import * as Blockly from 'blockly';
import { Order } from '../../java';

export default {
    block: 'get_entity',
    generator: function(block: Blockly.Block) {
        const entityId = block.getFieldValue('ID') || '1';
        const sanitizedId = entityId.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');
        const property = block.getFieldValue('PROPERTY') || 'null';

        if (property === 'isCustomNameVisible') {
            return [`customEntity${sanitizedId}.${property}()`, Order.ATOMIC];
        } else if (property === 'MaxHealth') {
            return [`customEntity${sanitizedId}.getAttribute(Attribute.GENERIC_MAX_HEALTH).getValue()`, Order.ATOMIC];
        } else {
            return [`customEntity${sanitizedId}.get${property}()`, Order.ATOMIC];
        }

    },
};
