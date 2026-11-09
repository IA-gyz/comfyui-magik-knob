class MagikKnobIntNode:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "knobValue": (  # <-- changed from "value" to "knobValue"
                    "INT",
                    {
                        "default": 1,
                        "min": 1,
                        "max": 999999,
                        "step": 1,
                        "widget": "magik_knob_int",
                    },
                ),
            }
        }

    RETURN_TYPES = ("INT",)
    RETURN_NAMES = (" ",)
    FUNCTION = "get_value"
    CATEGORY = "CRT/Utils/UI"

    def get_value(self, knobValue):  # <-- parameter name updated to match
        return (knobValue,)
