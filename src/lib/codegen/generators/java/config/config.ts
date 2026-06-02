import * as Blockly from 'blockly';
import { JavaGenerator } from '../../java.js';

export default {
    block: 'config',
    generator: function(block: Blockly.Block) {
        // Process all child blocks so their generators can add to configYamlLines
        JavaGenerator.statementToCode(block, 'CONTENT');
        return '';
    },
};
