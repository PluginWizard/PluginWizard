import * as Blockly from 'blockly';
import { JavaGenerator, Order, configYamlLines } from '../../java.js';
import { extractStringLiteral } from './config_utils.js';

export default {
    block: 'config_line',
    generator: function(block: Blockly.Block) {
        const keyCode = JavaGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '""';
        const contentCode = JavaGenerator.valueToCode(block, 'CONTENT', Order.ATOMIC) || '""';

        const key = extractStringLiteral(keyCode);
        const content = extractStringLiteral(contentCode);

        configYamlLines.push(`${key}: ${content}`);
        return '';
    },
};
