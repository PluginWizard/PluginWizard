import * as Blockly from 'blockly';
import { JavaGenerator, Order } from '../../java.js';

export default {
  block: 'text_getSubstring',
  generator: function(block: Blockly.Block) {
    const text = JavaGenerator.valueToCode(block, 'STRING', Order.ATOMIC);

    const where1 = block.getFieldValue('WHERE1');
    const where2 = block.getFieldValue('WHERE2');

    // Calculate start index
    let at1: string;
    if (where1 === 'FIRST') {
        at1 = '0';
    } else if (where1 === 'FROM_START') {
        const val = JavaGenerator.valueToCode(block, 'AT1', Order.ATOMIC);
        at1 = `(${val} - 1)`; // Blockly is 1-based, Java is 0-based
    } else if (where1 === 'FROM_END') {
        const val = JavaGenerator.valueToCode(block, 'AT1', Order.ATOMIC);
        at1 = `${text}.length() - ${val}`;
    } else {
        at1 = '0';
    }

    // Calculate end index
    let at2: string;
    if (where2 === 'LAST') {
        at2 = `${text}.length()`;
    } else if (where2 === 'FROM_START') {
        const val = JavaGenerator.valueToCode(block, 'AT2', Order.ATOMIC);
        at2 = `${val}`; // substring end is exclusive, so no need to adjust
    } else if (where2 === 'FROM_END') {
        const val = JavaGenerator.valueToCode(block, 'AT2', Order.ATOMIC);
        at2 = `${text}.length() - ${val} + 1`;
    } else {
        at2 = `${text}.length()`;
    }

    const code = `${text}.substring(${at1}, ${at2})`;
    return [code, Order.ATOMIC];
  },
};