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
export const FUNCTION_BLOCKS = ["def_function", FUNCTION_WITH_PARAMS_BLOCK]
export const CALL_BLOCKS = ["call_function", "call_function_silent", "call_function_params", "call_function_params_silent"]
const PLACEHOLDER_FUNCTION_NAME = "myFunction"

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

/** The workspace whose functions a block can call; flyout blocks look at the main workspace. */
function callableWorkspace(block: Blockly.Block | null): Blockly.Workspace | null {
    const workspace = block?.workspace
    if (!workspace) return null
    const target = workspace.isFlyout ? (workspace as Blockly.WorkspaceSvg).targetWorkspace : null
    return target ?? workspace
}

/** Names of the enabled functions with parameters, in workspace order, without duplicates. */
function functionWithParamsNames(workspace: Blockly.Workspace | null): string[] {
    if (!workspace) return []
    const names = workspace
        .getBlocksByType(FUNCTION_WITH_PARAMS_BLOCK, true)
        .filter((block) => block.isEnabled())
        .map((block) => block.getFieldValue("NAME").trim())
        .filter(Boolean)
    return [...new Set(names)]
}

/**
 * Dropdown of the workspace's functions with parameters. It accepts any name,
 * because a call can be loaded before its function, or outlive it; the
 * current name is always listed so it stays visible.
 */
class FieldFunctionName extends Blockly.FieldDropdown {
    constructor(value?: string) {
        super(function (this: Blockly.FieldDropdown) {
            const current = this.getValue?.() as string | null
            const names = functionWithParamsNames(callableWorkspace(this.getSourceBlock?.() ?? null))
            if (current && !names.includes(current)) names.unshift(current)
            if (names.length === 0) names.push(PLACEHOLDER_FUNCTION_NAME)
            return names.map((name): [string, string] => [name, name])
        })
        if (value) this.setValue(value)
    }

    static override fromJson(options: Blockly.FieldDropdownFromJsonConfig): FieldFunctionName {
        return new FieldFunctionName((options as { value?: string }).value)
    }

    // Functions come and go, so never reuse a cached option list.
    override getOptions(): Blockly.MenuOption[] {
        return super.getOptions(false)
    }

    protected override doClassValidation_(newValue?: string): string | null {
        return typeof newValue === "string" && newValue.trim() ? newValue : null
    }
}

Blockly.fieldRegistry.register("field_function_name", FieldFunctionName)

/** Point a freshly created call block at the first existing function instead of the placeholder. */
Blockly.Extensions.register("default_function_name", function (this: Blockly.Block) {
    const field = this.getField("NAME")
    if (field?.getValue() !== PLACEHOLDER_FUNCTION_NAME) return
    const first = functionWithParamsNames(callableWorkspace(this))[0]
    if (first) field.setValue(first)
})

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
 * Keep call blocks in line with the function definitions: follow a renamed
 * function, and give every call one input per parameter of the function it
 * names. Changes join the triggering event's group, so they undo together
 * with the edit that caused them.
 */
export function syncFunctionCalls(workspace: Blockly.Workspace, event?: Blockly.Events.Abstract): void {
    const previousGroup = Blockly.Events.getGroup()
    if (event?.group) Blockly.Events.setGroup(event.group)
    try {
        followFunctionRename(workspace, event)
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
        if (event?.group) Blockly.Events.setGroup(previousGroup)
    }
}

/** When a function is renamed, rename the calls that used its old name. */
function followFunctionRename(workspace: Blockly.Workspace, event?: Blockly.Events.Abstract): void {
    if (!(event instanceof Blockly.Events.BlockChange) || event.element !== "field" || event.name !== "NAME") return
    const definition = event.blockId ? workspace.getBlockById(event.blockId) : null
    if (!definition || !FUNCTION_BLOCKS.includes(definition.type)) return

    const oldName = String(event.oldValue ?? "").trim()
    const newName = String(event.newValue ?? "").trim()
    if (!oldName || !newName || oldName === newName) return
    // Another function still has the old name, so the calls may be meant for it.
    if (FUNCTION_BLOCKS.some((type) => workspace.getBlocksByType(type, false).some((block) => block !== definition && block.getFieldValue("NAME").trim() === oldName))) return

    for (const type of CALL_BLOCKS) {
        for (const call of workspace.getBlocksByType(type, false)) {
            if (call.getFieldValue("NAME").trim() === oldName) call.setFieldValue(newName, "NAME")
        }
    }
}
