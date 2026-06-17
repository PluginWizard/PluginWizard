import * as Blockly from 'blockly';

export default {
    block: 'reload_config',
    generator: function(_block: Blockly.Block) {
        return 'plugin.reloadConfig();\n';
    },
};
