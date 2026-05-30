import * as Blockly from 'blockly';
import { JavaGenerator, pluginCode } from '../../java.js';
import { JavaGeneratorUtils } from '../../JavaGeneratorUtil.js';

export default {
  block: 'default_function_main',
  generator: function(block: Blockly.Block) {
    const body = JavaGenerator.statementToCode(block, 'BODY') || '';
    return JavaGeneratorUtils.replacePlaceholderWithCode(pluginCode, "{userPluginCode}", body, 6); // no idea why it's 6 and not 8, but it works so I'm not questioning it
  }
};