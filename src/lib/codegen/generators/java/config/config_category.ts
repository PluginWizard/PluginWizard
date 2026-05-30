import * as Blockly from 'blockly';
import { JavaGenerator, Order, configYamlLines } from '../../java.js';
import { extractStringLiteral } from './config_utils.js';

export default {
    block: 'config_category',
    generator: function(block: Blockly.Block) {
        const key = extractStringLiteral(
            JavaGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '""'
        );

        // Record the insertion point so we can indent the children afterwards
        const startIndex = configYamlLines.length;

        // Process children; their generators will push to configYamlLines
        JavaGenerator.statementToCode(block, 'CONTENT');

        // Indent every line that the child blocks added
        for (let i = startIndex; i < configYamlLines.length; i++) {
            configYamlLines[i] = '  ' + configYamlLines[i];
        }

        // Insert the category key before its indented children
        configYamlLines.splice(startIndex, 0, `${key}:`);

        return '';
    },
};
