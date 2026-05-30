import * as Blockly from 'blockly';

const allBlocks: { [key: string]: any } = {};
const definitions: any[] = [];

const blockDefinitionModules = import.meta.glob('./custom/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Record<string, any>>;

for (const [modulePath, parsedDefinitions] of Object.entries(blockDefinitionModules)) {
  try {
    for (const blockName in parsedDefinitions) {
      allBlocks[blockName] = parsedDefinitions[blockName];

      definitions.push({
        type: blockName,
        ...parsedDefinitions[blockName],
      });
    }
  } catch (error) {
    console.error(`Error loading block definition from ${modulePath}:`, error);
  }
}

Blockly.defineBlocksWithJsonArray(definitions);

const customBlocks = allBlocks;

export function getCustomBlocks() {
  return customBlocks;
}