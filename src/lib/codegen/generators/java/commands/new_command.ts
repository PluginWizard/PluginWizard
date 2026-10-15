import * as Blockly from 'blockly';
import { JavaGenerator, pluginCommands, indent } from '../../java.js';

export default {
    block: 'new_command',
    generator: function(block: Blockly.Block) {
        const commandName = block.getFieldValue('CMD_NAME') || 'myCommand';

        let commandArguments = JavaGenerator.statementToCode(block, 'ARGS') || '';
        commandArguments = commandArguments.split('|').filter(line => line.trim() !== '').join('.').trim();

        let subCommands = JavaGenerator.statementToCode(block, 'SUBS') || '';
        subCommands = subCommands.split('|').filter(line => line.trim() !== '').join('').trim();

        const commandExecutes = JavaGenerator.statementToCode(block, 'DO') || '';

        if (commandArguments === '' && subCommands === '') {
            pluginCommands.push(commandOnly());
        } else if (commandArguments !== '' && subCommands === '') {
            pluginCommands.push(commandWithArgs());
        } else if (commandArguments === '' && subCommands !== '') {
            pluginCommands.push(commandWithSubs());
        } else {
            pluginCommands.push(commandWithArgsAndSubs());
        }

        function commandOnly() {
            return `CommandHelper.create("${commandName}")\n${indent(`.executes(ctx -> {\n${commandExecutes}}).register();`, 4)}\n`;
        }

        function commandWithArgs() {
            return `CommandHelper.create("${commandName}").${commandArguments}\n${indent(`.executes(ctx -> {\n${commandExecutes}}).register();`, 4)}\n`;
        }

        function commandWithSubs() {
            return `CommandHelper.create("${commandName}")${subCommands}\n${indent(`.executes(ctx -> {\n${commandExecutes}}).register();`, 4)}\n`;
        }

        function commandWithArgsAndSubs() {
            return `CommandHelper.create("${commandName}").${commandArguments}${subCommands}\n${indent(`.executes(ctx -> {\n${commandExecutes}}).register();`, 4)}\n`;
        }

        return '';
    }
}