import * as Blockly from "blockly"

const customTheme = Blockly.Theme.defineTheme("pluginwizard", {
    name: "pluginwizard",
    base: Blockly.Themes.Classic,
    componentStyles: {
        workspaceBackgroundColour: "#171717",
        toolboxBackgroundColour: "#1d1d1d",
        toolboxForegroundColour: "#f5f5f5",
        flyoutBackgroundColour: "#151515",
        flyoutForegroundColour: "#f5f5f5",
        scrollbarColour: "#4b5563cc"
    },
    blockStyles: {
        colour_blocks: {
            colourPrimary: "#22c55e",
            colourSecondary: "#16a34a",
            colourTertiary: "#15803d",
        },
        list_blocks: {
            colourPrimary: "#55af8a",
            colourSecondary: "#418664",
            colourTertiary: "#287e56",
        },
        logic_blocks: {
            colourPrimary: "#ef4444",
            colourSecondary: "#dc2626",
            colourTertiary: "#b91c1c",
        },
        loop_blocks: {
            colourPrimary: "#f97316",
            colourSecondary: "#ea580c",
            colourTertiary: "#c2410c",
        },
        math_blocks: {
            colourPrimary: "#3eb34e",
            colourSecondary: "#379944",
            colourTertiary: "#20792c",
        },
        procedure_blocks: {
            colourPrimary: "#14b8a6",
            colourSecondary: "#0d9488",
            colourTertiary: "#0f766e",
        },
        text_blocks: {
            colourPrimary: "#8b5cf6",
            colourSecondary: "#7c3aed",
            colourTertiary: "#6d28d9",
        },
        variable_blocks: {
            colourPrimary: "#ec4899",
            colourSecondary: "#db2777",
            colourTertiary: "#be185d",
        },
    },
    categoryStyles: {
        colour_category: {
            colour: "#22c55e",
        },
        list_category: {
            colour: "#a855f7",
        },
        logic_category: {
            colour: "#ef4444",
        },
        loop_category: {
            colour: "#f97316",
        },
        math_category: {
            colour: "#f59e0b",
        },
        procedure_category: {
            colour: "#14b8a6",
        },
        text_category: {
            colour: "#8b5cf6",
        },
        variable_category: {
            colour: "#ec4899",
        },
    },
})

export default customTheme