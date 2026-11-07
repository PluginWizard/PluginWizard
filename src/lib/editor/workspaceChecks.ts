import * as Blockly from "blockly"

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
}

const INPUT_LABELS: Record<string, string> = {
    ARGS: "Arguments",
    SUBS: "Subcommands",
}

/** Run every check and return the problems found, in display order. */
export function findWorkspaceProblems(workspace: Blockly.Workspace): WorkspaceProblem[] {
    return [...checkMainFunction(workspace), ...checkMisplacedBlocks(workspace)]
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
    const owner = block.getSurroundParent() as Blockly.BlockSvg | null
    block.unplug(true)
    block.setDisabledReason(true, Blockly.constants.MANUALLY_DISABLED)

    if (owner) {
        const ownerXY = owner.getRelativeToSurfaceXY()
        const { width } = owner.getHeightWidth()
        ;(block as Blockly.BlockSvg).moveTo(new Blockly.utils.Coordinate(ownerXY.x + width + 40, ownerXY.y))
        ;(block as Blockly.BlockSvg).bumpNeighbours()
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
