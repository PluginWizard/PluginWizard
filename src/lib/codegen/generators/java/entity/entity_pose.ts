import * as Blockly from 'blockly';
import { imports, Order } from '../../java';

export default {
    block: 'entity_pose',
    generator: function(block: Blockly.Block) {
        const pose = block.getFieldValue('POSE') || 'STANDING';
        
        imports.add('import org.bukkit.entity.Pose;');

        return [`Pose.${pose}`, Order.ATOMIC];
    },
};
