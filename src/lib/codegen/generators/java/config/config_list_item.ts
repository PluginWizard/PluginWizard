import * as Blockly from 'blockly';
import { JavaGenerator, Order, configYamlLines } from '../../java.js';
import { extractStringLiteral } from './config_utils.js';

export default {
    block: 'config_list_item',
    generator: function(block: Blockly.Block) {
        const contentCode = JavaGenerator.valueToCode(block, 'CONTENT', Order.ATOMIC) || '""';
        const content = extractStringLiteral(contentCode);
        configYamlLines.push(content);
        return '';
    },
};
