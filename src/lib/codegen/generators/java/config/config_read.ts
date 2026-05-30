import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
    block: 'config_read',
    generator: function(block: Blockly.Block) {
        const method = block.getFieldValue('METHOD') || 'getString';
        const key = JavaGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '""';
        const code = `config.${method}(${key})`;
        return [code, Order.ATOMIC];
    },
};
