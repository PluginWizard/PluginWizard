import * as Blockly from 'blockly';

export default {
  block: 'controls_flow_statements',
  generator: function(block: Blockly.Block) {
    const mode = block.getFieldValue('FLOW');
    let code;

    switch (mode) {
        case 'BREAK':
            code = 'break;\n';
            break;
        case 'CONTINUE':
            code = 'continue;\n';
            break;
        default:
            throw new Error('Unknown flow statement: ' + mode);
    }
    return code;
  },
};