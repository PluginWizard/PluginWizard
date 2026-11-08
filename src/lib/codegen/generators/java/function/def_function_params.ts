import * as Blockly from 'blockly';
import { JavaGenerator, pluginMethods, indent, getDefaultValueForType, imports } from '../../java.js';
import { JavaGeneratorUtils } from '../../JavaGeneratorUtil.js';
import { getFunctionParameters } from '../../../../editor/blocks/functionParameters';
import { javaIdentifier } from './function_utils.js';

export default {
  block: 'def_function_params',
  generator: function(block: Blockly.Block) {
    const name = javaIdentifier(block.getFieldValue('NAME'), 'myFunction');
    const returnType = block.getFieldValue('RET_TYPE') || 'void';
    const body = JavaGenerator.statementToCode(block, 'BODY') || '';

    let fixedBody = body;
    if (returnType !== 'void' && !body.includes('return')) {
      fixedBody += `return ${getDefaultValueForType(returnType)};\n`;
    }

    const params = getFunctionParameters(block);
    // Import every class a type mentions, e.g. both List and Player for List<Player>.
    for (const type of [returnType, ...params.map((param) => param.type)]) {
      for (const className of type.match(/[A-Za-z]+/g) ?? []) {
        const importStatement = JavaGeneratorUtils.getImport(className);
        if (importStatement) {
          imports.add(importStatement);
        }
      }
    }

    const paramList = params.map((param) => `${param.type} ${javaIdentifier(param.name, 'value')}`).join(', ');
    pluginMethods.push(`private ${returnType} ${name}(${paramList}) {\n${indent(fixedBody, 4)}}\n`);
    return '';
  },
};
