import * as Blockly from "blockly"

/* =================================================================
 * Functions with parameters
 * A "def_function_params" block lists its parameters as
 * "function_parameter" blocks in its PARAMS input. Call blocks get one
 * value input (ARG0, ARG1, ...) per parameter of the function they name;
 * syncFunctionCalls keeps those inputs in line with the definitions.
 * ============================================================== */

export const FUNCTION_WITH_PARAMS_BLOCK = "def_function_params"
export const PARAMETER_BLOCK = "function_parameter"
export const PARAMETER_GET_BLOCK = "function_parameter_get"
const CALL_BLOCKS = ["call_function", "call_function_silent"]

export interface FunctionParameter {
    name: string
    type: string
}

type CallBlock = Blockly.Block & { argNames_: string[] }

interface CallExtraState {
    args?: string[]
}

/** The enabled parameters of a function definition, in order. */
export function getFunctionParameters(definition: Blockly.Block): FunctionParameter[] {
    const params: FunctionParameter[] = []
    let child = definition.getInputTargetBlock("PARAMS")
    while (child) {
        if (child.type === PARAMETER_BLOCK && child.isEnabled()) {
            params.push({ name: child.getFieldValue("NAME").trim(), type: child.getFieldValue("TYPE") })
        }
        child = child.getNextBlock()
    }
    return params
}

/** The enabled function-with-parameters definition with the given name, if any. */
export function findFunctionDefinition(workspace: Blockly.Workspace, name: string): Blockly.Block | null {
    const wanted = name.trim()
    return workspace
        .getBlocksByType(FUNCTION_WITH_PARAMS_BLOCK, false)
        .find((block) => block.isEnabled() && block.getFieldValue("NAME").trim() === wanted) ?? null
}

/** The parameter names a call block currently has inputs for. */
export function getCallArgumentNames(block: Blockly.Block): string[] {
    return (block as CallBlock).argNames_ ?? []
}

function sameNames(a: string[], b: string[]): boolean {
    return a.length === b.length && a.every((name, i) => name === b[i])
}

/**
 * Rebuild a call block's argument inputs. Plugged-in values follow their
 * parameter by name; a renamed parameter keeps the value at its position.
 */
function setCallArguments(block: CallBlock, names: string[]): void {
    const oldNames = block.argNames_
    if (sameNames(oldNames, names)) return

    const values = oldNames.map((_, i) => {
        const value = block.getInputTargetBlock(`ARG${i}`)
        value?.unplug()
        return value
    })
    oldNames.forEach((_, i) => block.removeInput(`ARG${i}`, true))

    block.argNames_ = [...names]
    names.forEach((name, i) => {
        const input = block.appendValueInput(`ARG${i}`).setAlign(Blockly.inputs.Align.RIGHT).appendField(name)
        const oldIndex = oldNames.indexOf(name)
        const value = oldIndex !== -1 ? values[oldIndex] : !names.includes(oldNames[i]) ? values[i] : null
        if (value?.outputConnection && !value.isDisposed()) {
            input.connection?.connect(value.outputConnection)
            values[values.indexOf(value)] = null
        }
    })

    // Values whose parameter is gone stay on the workspace; move them clear of the call.
    if (values.some(Boolean) && block instanceof Blockly.BlockSvg) block.bumpNeighbours()
}

Blockly.Extensions.registerMutator(
    "function_call_arguments",
    {
        saveExtraState(this: CallBlock): CallExtraState | null {
            return this.argNames_.length > 0 ? { args: [...this.argNames_] } : null
        },
        loadExtraState(this: CallBlock, state: CallExtraState): void {
            setCallArguments(this, Array.isArray(state?.args) ? state.args.map(String) : [])
        },
    },
    function (this: CallBlock) {
        this.argNames_ = []
    },
)

function extraStateText(block: Blockly.Block): string {
    const state = block.saveExtraState?.()
    return state ? JSON.stringify(state) : ""
}

/**
 * Give every call block one input per parameter of the function it names.
 * Changes are recorded as mutation events in the given event group, so they
 * undo together with the edit that caused them.
 */
export function syncFunctionCalls(workspace: Blockly.Workspace, group?: string): void {
    const previousGroup = Blockly.Events.getGroup()
    if (group) Blockly.Events.setGroup(group)
    try {
        for (const type of CALL_BLOCKS) {
            for (const call of workspace.getBlocksByType(type, false) as CallBlock[]) {
                const definition = findFunctionDefinition(workspace, call.getFieldValue("NAME") ?? "")
                const names = definition ? getFunctionParameters(definition).map((param) => param.name) : []
                if (sameNames(call.argNames_, names)) continue

                const before = extraStateText(call)
                setCallArguments(call, names)
                const BlockChange = Blockly.Events.get(Blockly.Events.BLOCK_CHANGE)
                Blockly.Events.fire(new BlockChange(call, "mutation", null, before, extraStateText(call)))
            }
        }
    } finally {
        if (group) Blockly.Events.setGroup(previousGroup)
    }
}
