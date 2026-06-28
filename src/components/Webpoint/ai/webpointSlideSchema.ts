/** Schema + guidance appended to every WebPoint AI prompt so the agent returns
 *  a machine-applicable JSON deck. */
export const WEBPOINT_SLIDE_SCHEMA = `Respond with a SINGLE JSON object inside a \`\`\`json code block and nothing else.

Schema:
{
  "action": "replace_deck" | "update_slide" | "add_slides",
  "message": "one short sentence describing what you did",
  "title": "optional deck title (replace_deck only)",
  "slides": [Slide, ...],   // for replace_deck or add_slides
  "slide": Slide            // for update_slide (applies to the slide the user is viewing)
}

Slide = {
  "title": string,
  "notes": string,
  "transition": "none"|"fade"|"slide"|"zoom"|"flip",
  "background": {"type":"solid","color":"#hex"} | {"type":"gradient","gradient":{"kind":"linear"|"radial","angle":number,"stops":[{"color":"#hex","position":0-100}]}},
  "elements": [Element, ...]
}

Positions x,y,w,h are PERCENT (0-100) of the slide. fontSize is px on a 1280x720 canvas.
Text element:  {"type":"text","x":n,"y":n,"w":n,"h":n,"content":string,"style":{"color":"#hex","fontSize":n,"fontFamily":string,"fontWeight":n,"fontStyle":"normal"|"italic","textAlign":"left"|"center"|"right","lineHeight":n,"letterSpacing":n},"animation":{"type":"none"|"fade"|"slide-up"|"slide-down"|"slide-left"|"slide-right"|"zoom"|"bounce","duration":n,"delay":n}}
Shape element: {"type":"shape","shape":"rectangle"|"ellipse","x":n,"y":n,"w":n,"h":n,"style":{"fill":"#hex","borderRadius":n,"opacity":0-1},"animation":{...}}

Guidelines:
- Use "update_slide" to change the slide the user is viewing, "replace_deck" to build a whole new deck, "add_slides" to append slides.
- Titles ~56-72px, body ~28-40px, high contrast with the background, no overlapping elements.
- Prefer tasteful gradient backgrounds.
- Output ONLY the JSON object.`
