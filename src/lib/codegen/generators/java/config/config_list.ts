import * as Blockly from 'blockly';
import { JavaGenerator, Order, configYamlLines } from '../../java.js';
import { extractStringLiteral } from './config_utils.js';

export default {
    block: 'config_list',
    generator: function(block: Blockly.Block) {
        const key = extractStringLiteral(
            JavaGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '""'
        );

        const startIndex = configYamlLines.length;
        JavaGenerator.statementToCode(block, 'ITEMS');

        const hasItems = configYamlLines.length > startIndex;
        if (!hasItems) {
            configYamlLines.push(`${key}: []`);
            return '';
        }

        for (let i = startIndex; i < configYamlLines.length; i++) {
            configYamlLines[i] = `  - ${configYamlLines[i]}`;
        }

        configYamlLines.splice(startIndex, 0, `${key}:`);
        return '';
    },
};
