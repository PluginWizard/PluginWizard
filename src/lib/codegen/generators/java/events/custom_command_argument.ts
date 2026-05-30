import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
    block: 'custom_command_argument',
    generator: function(block: Blockly.Block) {
        const argVarName = block.getFieldValue('ARG_NAME') || 'customArg';
        const customArgList = JavaGenerator.valueToCode(block, 'CUSTOM_ARGS', Order.ATOMIC) || '';

        return `customArg("${argVarName}", ${customArgList})|`;
    }
}