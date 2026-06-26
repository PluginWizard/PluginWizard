import * as Blockly from 'blockly';
import { JavaGenerator, indent, imports } from '../../java.js';

export default {
    block: 'minecraft_event',
    generator: function(block: Blockly.Block) {
        const eventClass = block.getFieldValue('EVENT_CLASS') || 'PlayerJoinEvent.class';
        const executes = JavaGenerator.statementToCode(block, 'DO') || '';

        imports.add(`import org.bukkit.event.${eventClass.replace('.class', '')};`);

        return `Helpers.eventHelper.subscribe(${eventClass}, event -> {\n${indent(executes, 4)}});\n`;
    }
}