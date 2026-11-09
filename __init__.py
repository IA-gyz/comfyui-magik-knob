# __init__.py
# Magik Knob Node - ComfyUI custom node

import folder_paths
from .magik_knob import MagikKnobIntNode

NODE_CLASS_MAPPINGS = {
    "MagikKnobIntNode": MagikKnobIntNode,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "MagikKnobIntNode": "Magik Knob Int",
}

# Serve the JavaScript / CSS assets from the 'js' subfolder
WEB_DIRECTORY = "js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]