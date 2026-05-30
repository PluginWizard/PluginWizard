import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
    block: 'minecraft_event',
    generator: function(block: Blockly.Block) {
        const eventClass = block.getFieldValue('EVENT_CLASS') || 'PlayerJoinEvent.class';
        const executes = JavaGenerator.statementToCode(block, 'DO') || '';
        return `Helpers.eventHelper.subscribe(${eventClass}, event -> {\n${indent(executes, 4)}});\n`;
    }
}