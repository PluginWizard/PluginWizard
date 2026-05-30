import * as Blockly from 'blockly';
import { JavaGenerator, Order, configYamlLines } from '../../java.js';
import { extractStringLiteral } from './config_utils.js';

export default {
    block: 'config_comment',
    generator: function(block: Blockly.Block) {
        const textCode = JavaGenerator.valueToCode(block, 'TEXT', Order.ATOMIC) || '""';
        const text = extractStringLiteral(textCode);
        configYamlLines.push(`# ${text}`);
        return '';
    },
};
