import * as Blockly from 'blockly';
import { JavaGenerator, Order, getDefaultValueForType } from '../../java.js';
import { JavaGeneratorConfig } from '../../JavaGeneratorConfig.js';
import { findFunctionDefinition, getCallArgumentNames, getFunctionParameters } from '../../../../editor/blocks/functionParameters';

const RESERVED_WORDS = new Set(JavaGeneratorConfig.RESERVED_WORDS.split(','));

/** Turn user text into a valid Java identifier, so function and parameter names always compile. */
export function javaIdentifier(name: string, fallback: string): string {
  let id = (name ?? '').trim().replace(/[^A-Za-z0-9_$]/g, '_');
  if (!id) id = fallback;
  if (/^[0-9]/.test(id)) id = `_${id}`;
  if (RESERVED_WORDS.has(id)) id = `${id}_`;
  return id;
}

/** `name(arg0, arg1, ...)` for a call block. Empty argument inputs get the parameter type's default value. */
export function functionCallCode(block: Blockly.Block): string {
  const name = javaIdentifier(block.getFieldValue('NAME'), 'myFunction');
  const definition = findFunctionDefinition(block.workspace, block.getFieldValue('NAME') ?? '');
  const params = definition ? getFunctionParameters(definition) : [];

  const args = getCallArgumentNames(block).map((_, i) =>
    JavaGenerator.valueToCode(block, `ARG${i}`, Order.NONE) || getDefaultValueForType(params[i]?.type ?? ''),
  );
  return `${name}(${args.join(', ')})`;
}
