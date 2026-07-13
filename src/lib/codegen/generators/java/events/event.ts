import * as Blockly from 'blockly';
import { JavaGenerator, indent, imports, pluginRegionEvents } from '../../java.js';

export default {
    block: 'minecraft_event',
    generator: function(block: Blockly.Block) {
        const eventClass = block.getFieldValue('EVENT_CLASS') || 'PlayerJoinEvent.class';
        const eventName = eventClass.replace('.class', '');
        const executes = JavaGenerator.statementToCode(block, 'DO') || '';

        const eventPackageMap: Record<string, string> = {
            BlockBreakEvent: 'block',
            BlockPlaceEvent: 'block',
            EntityPickupItemEvent: 'entity',
        };

        const eventPackage = eventPackageMap[eventName] ?? (eventName.startsWith('Block') ? 'block' : eventName.startsWith('Entity') ? 'entity' : 'player');

        imports.add(`import org.bukkit.event.${eventPackage}.${eventName};`);

        pluginRegionEvents.push(`Helpers.eventHelper.subscribe(${eventClass}, event -> {\n${indent(executes, 4)}});\n`);
        return '';
    }
}