import * as Blockly from 'blockly';

export default {
  block: 'call_function_silent',
  generator: function(block: Blockly.Block) {
    const name = block.getFieldValue('NAME') || 'myFunction';
    return `${name}();\n`;
  },
};