import * as Blockly from 'blockly';
import { JavaGenerator, Order, indent } from '../../java.js';

export default {
  block: 'lists_setIndex',
  generator: function(block: Blockly.Block) {
    const list = JavaGenerator.valueToCode(block, 'LIST', Order.ATOMIC) || 'new ArrayList<>()';
    const mode = block.getFieldValue('MODE'); // SET oder INSERT
    const where = block.getFieldValue('WHERE'); // FROM_START, FROM_END, FIRST, LAST, RANDOM
    const at = JavaGenerator.valueToCode(block, 'AT', Order.ATOMIC) || '1';
    const value = JavaGenerator.valueToCode(block, 'TO', Order.ATOMIC) || 'null';

    // Position berechnen
    let indexCode;
    switch (where) {
        case 'FROM_START':
            indexCode = `(${at} - 1)`;
            break;
        case 'FROM_END':
            indexCode = `(${list}.size() - ${at})`;
            break;
        case 'FIRST':
            indexCode = `0`;
            break;
        case 'LAST':
            indexCode = `${list}.size() - 1`;
            break;
        case 'RANDOM':
            indexCode = `(int)(Math.random() * ${list}.size())`;
            break;
        default:
            indexCode = `(${at} - 1)`;
    }

    // Code erzeugen
    let code;
    if (mode === 'SET') {
        code = `${list}.set(${indexCode}, ${value});`;
    } else if (mode === 'INSERT') {
        code = `${list}.add(${indexCode}, ${value});`;
    }
    return code + '\n';
  },
};