import * as Blockly from 'blockly';
import { JavaGeneratorConfig } from './JavaGeneratorConfig.js';
import { JavaGeneratorUtils } from './JavaGeneratorUtil.js';

export const JavaGenerator = new Blockly.CodeGenerator('Java');
export let imports = new Set<string>();
export let configYamlLines: string[] = [];
export let pluginMethods: string[] = [];
export let pluginRegionEvents: string[] = [];
export let pluginCommands: string[] = [];
export let pluginCode = "";

/* =================================================================
 * Blockly Java Code Generator
 * This file contains the Java code generator for Blockly blocks.
 * It defines how different blocks are translated into Java code.
 * ============================================================== */

// Blockly 12 uses nameDB to manage variable names instead of getting it directly from the json workspace
JavaGenerator.init = function(workspace: Blockly.Workspace) {
  if (!this.nameDB_) {
    this.nameDB_ = new Blockly.Names(JavaGeneratorConfig.RESERVED_WORDS);
  } else {
    this.nameDB_.reset();
  }

  this.nameDB_.setVariableMap(workspace.getVariableMap());
  this.definitions_ = Object.create(null);
};

/**
 * Common tasks for generating Java from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {Blockly.Block} block The current block.
 * @param {string} code The Java code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} Java code with comments and subsequent blocks added.
 */
JavaGenerator.scrub_ = function(block: Blockly.Block, code: string, opt_thisOnly?: boolean) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = opt_thisOnly ? '' : this.blockToCode(nextBlock);
  return code + nextCode;
};

/**
 * Dynamically loads all block generators from the 'java' directory.
 */

const generatorModules = import.meta.glob('./java/**/*.ts', { eager: true }) as Record<string, Record<string, any>>;

let generatorsLoaded = false;
export async function ensureJavaGeneratorsLoaded() {
  if (generatorsLoaded) return;

  console.info("Initializing Java block generators...");

  JavaGenerator.nameDB_ = new Blockly.Names("");

  for (const [modulePath, module] of Object.entries(generatorModules).sort(([a], [b]) => a.localeCompare(b))) {
    try {
      if (module.default?.block && module.default?.generator) {
        JavaGenerator.forBlock[module.default.block] = module.default.generator;
      }
      for (const exportName of Object.keys(module)) {
        const exp = module[exportName];
        if (exportName !== "default" && exp?.block && exp?.generator) {
          JavaGenerator.forBlock[exp.block] = exp.generator;
        }
      }
    } catch (error) {
      console.error(`Failed to load generator from ${modulePath}:`, error);
    }
  }

  console.info("Java block generators initialized.");
  console.info("Initializing plugin main class template...");
  pluginCode = await JavaGeneratorUtils.getPluginContent();
  console.info("Plugin template content loaded:", pluginCode ? "Yes" : "No");

  generatorsLoaded = true;
}

export function generateJava(workspace: Blockly.Workspace): { code: string; config: string } {
  const workspaceJson = Blockly.serialization.workspaces.save(workspace);
  const workspaceData = JavaGeneratorUtils.fixVariableSerialization(workspaceJson);
  const tempWorkspace = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(workspaceData, tempWorkspace);

  imports = new Set<string>();
  configYamlLines = [];
  pluginMethods = [];
  pluginRegionEvents = [];
  pluginCommands = [];
  JavaGenerator.init(tempWorkspace);
  const generatorCode = JavaGenerator.workspaceToCode(tempWorkspace);

  // Replace plugin placeholders with values
  let code = JavaGenerator.finish(generatorCode);
  code = JavaGeneratorUtils.replacePlaceholderWithCode(code, "{userPluginImports}", Array.from(imports).join('\n'), 0);
  code = JavaGeneratorUtils.replacePlaceholderWithCode(code, "{userPluginMethods}", pluginMethods.join('\n'), 4);
  code = JavaGeneratorUtils.replacePlaceholderWithCode(code, "{userPluginRegionEvents}", pluginRegionEvents.join('\n'), 8);
  code = JavaGeneratorUtils.replacePlaceholderWithCode(code, "{userPluginCommands}", pluginCommands.join('\n'), 8);

  return {
    code: JavaGenerator.finish(code),
    config: configYamlLines.join('\n'),
  };
}

// SHARED FUNCTIONS:
export function getDefaultValueForType(type: string) {
    switch (type) {
        case 'int': return '0';
        case 'double': return '0.0';
        case 'String': return '""';
        case 'boolean': return 'false';
        case 'Component': return 'Component.empty()';
        case 'List<String>':
        case 'List<Integer>':
        case 'List<Player>':
        case 'List<Location>':
            return 'List.of()';
        default:
            return 'null';
    }
}

export const Order = {
  ATOMIC: 0,
};

// Indentation of code
export function indent(code: string, spaces: number = 2) {
  const indentation = ' '.repeat(spaces);
  return code
    .split('\n')
    .map(line => (line.trim() ? indentation + line : line))
    .join('\n');
}