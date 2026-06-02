import customTheme from "./themes/customTheme";

export const toolboxCss = `
      body {
        overflow-y: scroll;
      }
      .blocklyToolboxScrollbar {
        display: none !important;
      }
      .blocklyFlyoutScrollbar {
        display: none !important;
      }
      .blocklyToolboxCategoryLabel {
        color: white;
        padding-bottom: 8px;
      }
      .categoryBubble {
        border: none;
      }
      .blocklyToolboxContents {
        padding: 0.5em;
      }
      .blocklyToolboxCategory {
        padding: 3px;
        margin-bottom: 0.5em;
        border-radius: 4px;
      }
      .blocklyFlyout, blocklyFlyoutBackground {
        overflow-x: scroll;
      }
      .blocklyTreeSeparator {
        border-bottom: solid #7e7e7eff 2.3px;
        margin: 0px 5px 12px 5px
      }
`;

export const getEditorConfig = (toolbox: any) => {
    return {
        toolbox: toolbox,
        theme: customTheme,
        plugins: {
            flyoutsVerticalToolbox: 'ContinuousFlyout',
            metricsManager: 'ContinuousMetrics',
            toolbox: 'ContinuousToolbox',
        },
        grid: {
            spacing: 25,
            length: 1,
            colour: "#ffffff44",
            snap: false,
        },
        zoom: {
            controls: false,
            wheel: true,
            startScale: 0.9,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.1,
        },
        scrollbars: true,
        sounds: false,
        renderer: "zelos",
        move: {
            scrollbars: {
            horizontal: true,
            vertical: true,
            },
            drag: true,
            wheel: true,
        },
        trashcan: true,
        toolboxPosition: "start",
    }
}
