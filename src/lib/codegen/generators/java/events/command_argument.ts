import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
    block: 'command_argument',
    generator: function(block: Blockly.Block) {
        const argVarName = block.getFieldValue('ARG_NAME') || 'arg';
        const argType = block.getFieldValue('ARG_TYPE') || 'string';

        return `${argType}("${argVarName}")|`;
    }
}