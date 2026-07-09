import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'lists_getSublist',
  generator: function(block: Blockly.Block) {
    const list = JavaGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || 'new ArrayList<>()';
    const where1 = block.getFieldValue('WHERE1') || 'FROM_START';
    const where2 = block.getFieldValue('WHERE2') || 'FROM_START';
    const at1 = JavaGenerator.valueToCode(block, 'AT1', Order.ATOMIC) || '1';
    const at2 = JavaGenerator.valueToCode(block, 'AT2', Order.ATOMIC) || '1';
    
    let index1: string;
    if (where1 === 'FROM_START') {
        index1 = `(${at1} - 1)`;
    } else if (where1 === 'FROM_END') {
        index1 = `(${list}.size() - ${at1})`;
    } else if (where1 === 'FIRST') {
        index1 = '0';
    } else if (where1 === 'LAST') {
        index1 = `(${list}.size() - 1)`;
    } else {
        index1 = `(${at1} - 1)`;
    }
    
    let index2: string;
    if (where2 === 'FROM_START') {
        index2 = at2;
    } else if (where2 === 'FROM_END') {
        index2 = `(${list}.size() - ${at2} + 1)`;
    } else if (where2 === 'FIRST') {
        index2 = '1';
    } else if (where2 === 'LAST') {
        index2 = `${list}.size()`;
    } else {
        index2 = at2;
    }
    
    const code = `${list}.subList(${index1}, ${index2})`;
    return [code, Order.ATOMIC];
  },
};