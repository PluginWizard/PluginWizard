import * as Blockly from 'blockly';
import { indent, JavaGenerator } from '../../java';

export default {
    block: 'entity_events',
    generator: function(block: Blockly.Block) {
        const eventType = block.getFieldValue('EVENT') || 'null';
        const entityId = block.getFieldValue('ID') || '1';
        const executionCode = JavaGenerator.statementToCode(block, 'DO');

        return `Helpers.eventHelper.forEntity("${entityId}").on(\n${indent(`${eventType}.class,\n${eventType}::getEntity,\nevent -> {\n${executionCode}}\n`, 4)});\n`;
    },
};
