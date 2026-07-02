import { indent } from './java.js';
import { JavaGeneratorConfig } from './JavaGeneratorConfig.js';

export class JavaGeneratorUtils {

    private static async fetchText(path: string): Promise<string> {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('Content-Type') ?? '';
        if (contentType.includes('text/html')) {
            throw new Error(`Failed to load ${path}: server returned HTML (resource not found)`);
        }
        return response.text();
    }

    /**
     * Blockly V12 has changed how variables are serialized in the workspace JSON. However the workspace structure of Blockly V12 has not yet implemented this change.
     * This function fixes the variable serialization in the given JSON representation of a Blockly workspace.
     * 
     * @param json The JSON representation of the Blockly workspace.
     * @returns The fixed JSON with corrected variable serialization.
     */
    static fixVariableSerialization(json: any): any {
        if (!json || typeof json !== 'object') return json;

        if (!json.variables) {
            json.variables = [];
        }

        const existingVars = new Set(json.variables.map((v: any) => v.id));

        const traverse = (block: any) => {
            if (!block) return;
            
            if (block.fields) {
                for (const key in block.fields) {
                    const value = block.fields[key];
                    if (key === 'VAR' && typeof value === 'string') {
                        const varId = value;
                        if (!existingVars.has(varId)) {
                            json.variables.push({
                                name: varId,
                                id: varId
                            });
                            existingVars.add(varId);
                        }
                    }
                }
            }
            
            if (block.inputs) {
                for (const key in block.inputs) {
                    const input = block.inputs[key];
                    if (input.block) traverse(input.block);
                    if (input.shadow) traverse(input.shadow);
                }
            }
            
            if (block.next) {
                if (block.next.block) traverse(block.next.block);
                if (block.next.shadow) traverse(block.next.shadow);
            }
        };

        if (json.blocks && json.blocks.blocks) {
            if (Array.isArray(json.blocks.blocks)) {
                for (const block of json.blocks.blocks) {
                    traverse(block);
                }
            }
        }
        
        return json;
    }

    static async getPluginContent(): Promise<string> {
        return await this.fetchText('/plugin/src/main/java/net/kalbskinder/plugin/UserPlugin.java');
    }

    static async getUserPluginContent(_pluginPath: string): Promise<string> {
        return this.getPluginContent();
    }

    /**
     * Replaces a commnet placeholder inside another string with the given code, while also indenting the code to fit the indentation level of the placeholder.
     * 
     * @param originalCode The original code containing the placeholder comment to be replaced. The placeholder should be in the format of a comment, e.g. "// {userPluginCode}"
     * @param placeholder The placeholder comment to be replaced, e.g. "{userPluginCode}"
     * @param code The code to replace the placeholder with
     * @param indentCount The number of spaces to indent the code
     */
    static replacePlaceholderWithCode(originalCode: string, placeholder: string, code: string, indentCount: number): string {
        // Placeholder will statrt with "// "
        return originalCode.replace(`// ${placeholder}`, indent(code, indentCount));
    }

    static getImport(className: string): string {
        const importPath = JavaGeneratorConfig.IMPORT_LOOKUP[className];
        if (importPath) {
            return `import ${importPath};`;
        }
        return '';
    }
}