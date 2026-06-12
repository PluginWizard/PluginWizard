import * as Blockly from 'blockly';
import { Order, JavaGenerator } from '../../java';

export default {
  block: 'logic_operation',
  generator: function(block: Blockly.Block) {
    const operator = block.getFieldValue('OP');
    const argument0 = JavaGenerator.valueToCode(block, 'A', Order.ATOMIC) || 'false';
    const argument1 = JavaGenerator.valueToCode(block, 'B', Order.ATOMIC) || 'false';
    const code = `${argument0} ${operator === 'AND' ? '&&' : '||'} ${argument1}`;
    return [code, Order.ATOMIC];
  },
};