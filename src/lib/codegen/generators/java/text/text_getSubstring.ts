import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'text_getSubstring',
  generator: function(block: Blockly.Block) {
    const text = JavaGenerator.valueToCode(block, 'STRING', Order.ATOMIC);

    // Helper to get index code based on mode
    function getIndexCode(modeField: string, atField: string) {
        const mode = block.getFieldValue(modeField);
        let indexCode: string;
        if (mode === 'FROM_START') {
            const at = JavaGenerator.valueToCode(block, atField, Order.ATOMIC);
            indexCode = `(${at} - 1)`; // Blockly is 1-based, Java is 0-based
        } else if (mode === 'FROM_END') {
            const at = JavaGenerator.valueToCode(block, atField, Order.ATOMIC);
            indexCode = `${text}.length() - ${at}`;
        } else if (mode === 'LAST') {
            indexCode = `${text}.length() - 1`;
        } else {
            // Should not happen, but fallback
            indexCode = '0';
        }
        return indexCode;
    }

    const where1 = block.getFieldValue('WHERE1');
    const where2 = block.getFieldValue('WHERE2');

    const at1 = where1 === 'LAST' ? null : getIndexCode('WHERE1', 'AT1');
    const at2 = where2 === 'LAST' ? null : getIndexCode('WHERE2', 'AT2');

    // If LAST, use length-1 for end, and for substring, end index is exclusive, so add +1
    let code: string;
    if (at1 !== null && at2 !== null) {
        code = `${text}.substring(${at1}, ${at2} + 1)`;
    } else if (at1 !== null && at2 === null) {
        // To last letter
        code = `${text}.substring(${at1})`;
    } else if (at1 === null && at2 !== null) {
        // From first/last letter to at2
        code = `${text}.substring(0, ${at2} + 1)`;
    } else {
        // Both are last letter, just get last char
        code = `${text}.substring(${text}.length() - 1)`;
    }

    return [code, Order.ATOMIC];
  },
};