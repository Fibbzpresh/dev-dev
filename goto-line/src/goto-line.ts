import {panels, Panel, getPanel, showPanel} from "@codemirror/next/panel"
import {EditorSelection} from "@codemirror/next/state"
import {EditorView, Command} from "@codemirror/next/view"

function createLineDialog(view: EditorView): Panel {
  let dom = document.createElement("form")
  dom.innerHTML = `<label>${view.state.phrase("Go to line:")} <input name=line></label>
<button type=submit>${view.state.phrase("go")}</button>`
  let input = dom.querySelector("input") as HTMLInputElement

  function go() {
    let n = parseInt(input.value, 10)
    view.dispatch(view.state.update({
      replaceExtensions: {[tag]: [baseTheme]},
      selection: !isNaN(n) && n > 0 && n <= view.state.doc.lines ? EditorSelection.cursor(view.state.doc.line(n).start) : undefined
    }))
    view.focus()
  }
  dom.addEventListener("keydown", event => {
    if (event.keyCode == 27) { // Escape
      event.preventDefault()
      view.dispatch(view.state.update({replaceExtensions: {[tag]: [baseTheme]}}))
      view.focus()
    } else if (event.keyCode == 13) { // Enter
      event.preventDefault()
      go()
    }
  })
  dom.addEventListener("submit", go)

  return {dom, style: "gotoLine", pos: -10}
}

const tag = typeof Symbol == "undefined" ? "__goto-line" : Symbol("goto-line")

/// Command that shows a dialog asking the user for a line number, and
/// when a valid number is provided, moves the cursor to that line.
///
/// The dialog can be styled with the `panel.gotoLine` theme
/// selector.
export const gotoLine: Command = view => {
  let panel = getPanel(view, createLineDialog)
  if (!panel) {
    view.dispatch(view.state.update({replaceExtensions: {[tag]: [panels(), showPanel.of(createLineDialog), baseTheme]}}))
    panel = getPanel(view, createLineDialog)
  }
  if (panel) panel.dom.querySelector("input")!.focus()
  return true
}

const baseTheme = EditorView.baseTheme({
  "panel.gotoLine": {
    padding: "2px 6px 4px",
    "& label": { fontSize: "80%" }
  }
})
