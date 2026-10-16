import * as Blockly from 'blockly';
import { JavaGenerator, Order, getDefaultValueForType, imports, pluginFields, pluginFieldValues } from '../../java.js';
import { JavaGeneratorUtils } from '../../JavaGeneratorUtil.js';

/**
 * Declares a field of UserPlugin. The value is assigned in the constructor rather than in a
 * field initializer, because initializers run before `plugin` and `config` are set.
 */
export default {
  block: 'variables_declare_global',
  generator: function(block: Blockly.Block) {
    const isFinal = block.getFieldValue('FINAL') === 'TRUE';
    const type = block.getFieldValue('TYPE') || 'Object';
    const varName = JavaGenerator.nameDB_?.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME) || 'var';
    const valueCode = JavaGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || getDefaultValueForType(type);

    const importStatement = JavaGeneratorUtils.getImport(type);
    if (importStatement) {
      imports.add(importStatement);
    }

    pluginFields.push(`private ${isFinal ? 'final ' : ''}${type} ${varName};`);
    pluginFieldValues.push(`this.${varName} = ${valueCode};`);
    return '';
  },
};
