import * as Blockly from 'blockly';
import { functionCallCode } from './function_utils.js';

export default {
  block: 'call_function_silent',
  generator: function(block: Blockly.Block) {
    return `${functionCallCode(block)};\n`;
  },
};
