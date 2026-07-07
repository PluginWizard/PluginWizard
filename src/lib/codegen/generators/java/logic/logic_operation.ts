import * as Blockly from 'blockly';
import { Order, JavaGenerator } from '../../java';

export default {
  block: 'logic_operation',
  generator: function(block: Blockly.Block) {
    const operator = block.getFieldValue('OP');
    const order = operator === 'AND' ? Order.LOGICAL_AND : Order.LOGICAL_OR;
    const argument0 = JavaGenerator.valueToCode(block, 'A', order) || 'false';
    const argument1 = JavaGenerator.valueToCode(block, 'B', order) || 'false';
    const code = `${argument0} ${operator === 'AND' ? '&&' : '||'} ${argument1}`;
    return [code, order];
  },
};