import * as Blockly from "blockly"
import { FUNCTION_WITH_PARAMS_BLOCK, PARAMETER_BLOCK, PARAMETER_GET_BLOCK, getFunctionParameters } from "./blocks/functionParameters"

/** A problem in the workspace that would break or change the generated plugin. */
export interface WorkspaceProblem {
    /** Stable key for React lists. */
    id: string
    message: string
    /** Block to jump to when the problem is clicked, if there is one. */
    blockId?: string
    /** Automatic fix, if the problem has an obvious one. */
    fix?: {
        label: string
        run: (workspace: Blockly.WorkspaceSvg) => void
    }
}

const MAIN_FUNCTION_BLOCK = "default_function_main"

/**
 * Statement inputs that only make sense with specific block types. Blockly's
 * connection checks can't enforce this (an untyped block fits any input), so
 * offending blocks are reported as problems instead.
 */
const RESTRICTED_INPUTS: Record<string, Record<string, string[]>> = {
    new_command: {
        ARGS: ["command_argument", "custom_command_argument"],
        SUBS: ["sub_command"],
    },
    sub_command: {
        ARGS: ["command_argument", "custom_command_argument"],
    },
    [FUNCTION_WITH_PARAMS_BLOCK]: {
        PARAMS: [PARAMETER_BLOCK],
    },
}

const INPUT_LABELS: Record<string, string> = {
    ARGS: "Arguments",
    SUBS: "Subcommands",
    PARAMS: "Parameters",
}

/** Run every check and return the problems found, in display order. */
export function findWorkspaceProblems(workspace: Blockly.Workspace): WorkspaceProblem[] {
    const problems = [...checkMainFunction(workspace), ...checkMisplacedBlocks(workspace), ...checkFunctionParameters(workspace)]
    // A block can fail several checks; report it once, with the first message.
    const seen = new Set<string>()
    return problems.filter((problem) => !seen.has(problem.id) && seen.add(problem.id))
}

/** The plugin can only be generated with exactly one main function block. */
function checkMainFunction(workspace: Blockly.Workspace): WorkspaceProblem[] {
    const mainBlocks = workspace.getBlocksByType(MAIN_FUNCTION_BLOCK, false)

    if (mainBlocks.length === 0) {
        return [{
            id: "main-missing",
            message: "Missing \"Main function\" block. It is required to build the plugin, even if it's empty.",
            fix: { label: "Add block", run: addMainFunctionBlock },
        }]
    }

    return mainBlocks.slice(1).map((block) => ({
        id: `main-duplicate-${block.id}`,
        message: "Only one \"Main function\" block is allowed. Remove the extra one.",
        blockId: block.id,
    }))
}

/** Blocks that sit in a restricted input they do not belong in. */
function checkMisplacedBlocks(workspace: Blockly.Workspace): WorkspaceProblem[] {
    const problems: WorkspaceProblem[] = []
    for (const block of workspace.getAllBlocks(false)) {
        const restricted = RESTRICTED_INPUTS[block.type]
        if (!restricted) continue

        for (const [inputName, allowed] of Object.entries(restricted)) {
            let child = block.getInputTargetBlock(inputName)
            while (child) {
                if (!allowed.includes(child.type)) {
                    const misplaced = child
                    problems.push({
                        id: `misplaced-${misplaced.id}`,
                        message: `"${blockLabel(misplaced)}" doesn't belong in ${INPUT_LABELS[inputName] ?? inputName}.`,
                        blockId: misplaced.id,
                        fix: { label: "Move out", run: () => detachBlock(misplaced) },
                    })
                }
                child = child.getNextBlock()
            }
        }
    }
    return problems
}

/** Parameter blocks outside a function's Parameters, duplicate names, and reads of unknown parameters. */
function checkFunctionParameters(workspace: Blockly.Workspace): WorkspaceProblem[] {
    const problems: WorkspaceProblem[] = []

    for (const definition of workspace.getBlocksByType(FUNCTION_WITH_PARAMS_BLOCK, false)) {
        const seen = new Set<string>()
        let param = definition.getInputTargetBlock("PARAMS")
        while (param) {
            const name = param.getFieldValue("NAME")?.trim()
            if (param.type === PARAMETER_BLOCK && param.isEnabled() && name) {
                if (seen.has(name)) {
                    problems.push({
                        id: `param-duplicate-${param.id}`,
                        message: `Parameter "${name}" is defined twice in the same function. Rename one of them.`,
                        blockId: param.id,
                    })
                }
                seen.add(name)
            }
            param = param.getNextBlock()
        }
    }

    // Parameters plugged in anywhere other than a function's Parameters input.
    for (const param of workspace.getBlocksByType(PARAMETER_BLOCK, false)) {
        if (!param.isEnabled()) continue
        const container = containingInput(param)
        if (!container || (container.owner.type === FUNCTION_WITH_PARAMS_BLOCK && container.inputName === "PARAMS")) continue
        problems.push({
            id: `misplaced-${param.id}`,
            message: `"${blockLabel(param)}" only works in the Parameters of a function with parameters.`,
            blockId: param.id,
            fix: { label: "Move out", run: () => detachBlock(param) },
        })
    }

    // Reads of a parameter the surrounding function doesn't have.
    for (const read of workspace.getBlocksByType(PARAMETER_GET_BLOCK, false)) {
        if (!read.isEnabled() || read.getRootBlock() === read) continue
        const name = read.getFieldValue("NAME")?.trim()
        const definition = enclosingFunction(read)
        if (definition && getFunctionParameters(definition).some((param) => param.name === name)) continue
        problems.push({
            id: `param-unknown-${read.id}`,
            message: definition
                ? `This function has no parameter "${name}".`
                : `Parameter "${name}" can only be used inside a function with parameters.`,
            blockId: read.id,
        })
    }

    return problems
}

/** The function-with-parameters block a block is nested in, if any. */
function enclosingFunction(block: Blockly.Block): Blockly.Block | null {
    let parent = block.getSurroundParent()
    while (parent && parent.type !== FUNCTION_WITH_PARAMS_BLOCK) parent = parent.getSurroundParent()
    return parent
}

/** The block and input a statement block's stack is plugged into, or null for a top-level stack. */
function containingInput(block: Blockly.Block): { owner: Blockly.Block; inputName: string } | null {
    let current = block
    let parent = current.getParent()
    while (parent && parent.getNextBlock() === current) {
        current = parent
        parent = current.getParent()
    }
    const input = parent?.getInputWithBlock(current)
    return parent && input ? { owner: parent, inputName: input.name } : null
}

/** Run every available fix as a single undo step. */
export function fixAllProblems(workspace: Blockly.WorkspaceSvg, problems: WorkspaceProblem[]): void {
    Blockly.Events.setGroup(true)
    try {
        problems.forEach((problem) => problem.fix?.run(workspace))
    } finally {
        Blockly.Events.setGroup(false)
    }
}

/** Select a problem's block and scroll it into view. */
export function revealProblem(workspace: Blockly.WorkspaceSvg, problem: WorkspaceProblem): void {
    if (!problem.blockId) return
    const block = workspace.getBlockById(problem.blockId)
    if (!block) return
    Blockly.common.setSelected(block)
    workspace.centerOnBlock(block.id)
}

/** The first line of a block's visible text, for use in messages. */
function blockLabel(block: Blockly.Block): string {
    const text = block.toString(30).trim()
    return text || block.type
}

/**
 * Pull a block out of its input and drop it, disabled, beside the block it
 * was in, so it no longer ends up in the generated code.
 */
function detachBlock(block: Blockly.Block): void {
    const owner = block.getSurroundParent()
    block.unplug(true)
    block.setDisabledReason(true, Blockly.constants.MANUALLY_DISABLED)

    if (owner instanceof Blockly.BlockSvg && block instanceof Blockly.BlockSvg) {
        const ownerXY = owner.getRelativeToSurfaceXY()
        const { width } = owner.getHeightWidth()
        block.moveTo(new Blockly.utils.Coordinate(ownerXY.x + width + 40, ownerXY.y))
        block.bumpNeighbours()
    }
}

/** Add an empty main function block in the top left of the visible area. */
function addMainFunctionBlock(workspace: Blockly.WorkspaceSvg): void {
    const block = workspace.newBlock(MAIN_FUNCTION_BLOCK)
    block.initSvg()
    block.render()

    const view = workspace.getMetricsManager().getViewMetrics(true)
    block.moveTo(new Blockly.utils.Coordinate(view.left + 40, view.top + 40))
    block.bumpNeighbours()
    Blockly.common.setSelected(block)
}
