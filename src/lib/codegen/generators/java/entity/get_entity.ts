import * as Blockly from 'blockly';
import { Order } from '../../java';

export default {
    block: 'get_entity',
    generator: function(block: Blockly.Block) {
        const entityId = block.getFieldValue('ID') || '1';
        const property = block.getFieldValue('PROPERTY') || 'null';

        if (property === 'isCustomNameVisible') {
            return [`customEntity${entityId}.${property}()`, Order.ATOMIC];
        } else if (property === 'MaxHealth') {
            return [`customEntity${entityId}.getAttribute(Attribute.GENERIC_MAX_HEALTH).getValue()`, Order.ATOMIC];
        } else {
            return [`customEntity${entityId}.get${property}()`, Order.ATOMIC];
        }

    },
};
