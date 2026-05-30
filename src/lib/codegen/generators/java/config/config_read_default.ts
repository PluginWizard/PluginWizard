import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
    block: 'config_read_default',
    generator: function(block: Blockly.Block) {
        const method = block.getFieldValue('METHOD') || 'getString';
        const key = JavaGenerator.valueToCode(block, 'KEY', Order.ATOMIC) || '""';
        const defaultValue = JavaGenerator.valueToCode(block, 'DEFAULT', Order.ATOMIC) || 'null';
        const code = `config.${method}(${key}, ${defaultValue})`;
        return [code, Order.ATOMIC];
    },
};
