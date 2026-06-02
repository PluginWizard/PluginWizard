import * as Blockly from 'blockly';
import { JavaGenerator } from '../../java.js';

export default {
    block: 'sub_command',
    generator: function(block: Blockly.Block) {
        const subCommandName = block.getFieldValue('SUB_NAME') || 'subcommand';

        let subCommandArguments = JavaGenerator.statementToCode(block, 'ARGS') || '';
        subCommandArguments = subCommandArguments.split('|').filter(line => line.trim() !== '').join('.').trim();

        const subCommandExecutes = JavaGenerator.statementToCode(block, 'DO') || '';

        if (subCommandArguments === '') {
            return subCommandOnly();
        } else {
            return subCommandWithArgs();
        }
        
        function subCommandOnly() {
            return `.sub("${subCommandName}")\n.executes(ctx -> {\n${subCommandExecutes}}).end()|`;
        }

        function subCommandWithArgs() {
            return `.sub("${subCommandName}").${subCommandArguments}\n.executes(ctx -> {\n${subCommandExecutes}}).end()|`;
        }
    }
}