import * as Blockly from 'blockly';
import { JavaGenerator, pluginMethods, indent, getDefaultValueForType, imports } from '../../java.js';
import { JavaGeneratorUtils } from '../../JavaGeneratorUtil.js';

export default {
  block: 'def_function',
  generator: function(block: Blockly.Block) {
    const name = block.getFieldValue('NAME') || 'myFunction';
    const returnType = block.getFieldValue('RET_TYPE') || 'void';
    const body = JavaGenerator.statementToCode(block, 'BODY') || '';
    
    let fixedBody = body;
    if (returnType !== 'void' && !body.includes('return')) {
        fixedBody += `return ${getDefaultValueForType(returnType)};\n`;
    }

    const importStatement = JavaGeneratorUtils.getImport(returnType);
    if (importStatement) {
        imports.add(importStatement);
    }
    
    const code = `private ${returnType} ${name}() {\n${indent(fixedBody, 4)}}\n`;
    pluginMethods.push(code);
    return '';
  },
};