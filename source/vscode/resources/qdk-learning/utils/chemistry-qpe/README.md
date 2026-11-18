# Chemistry course tools

Scripts used to generate the QDK/Chemistry ground-state QPE tutorial as the
notebook course at `source/vscode/resources/qdk-learning/courses/chemistry-qpe`.

The course supports `qdk-chemistry>=2.2.0`. Its source tutorial and
companion Python files come from QDK/Chemistry tag `v2.2.0`, commit
`f28a4f87a0fc0aa0308b67b1f507c9692cc655df`.

These are authoring tools, not product code, and are excluded from the extension
package by `.vscodeignore`. They locate the course relative to this folder.

They also need a built copy of the qdk-chemistry documentation, because the
notebooks are generated from the tutorial's own source rather than from its
rendered pages:

    <docs>/_sources/tutorials/...rst.txt   the tutorial source text
    <docs>/_static/examples/python/*.py    the example scripts the cells quote

Both are published as part of the Sphinx site at
<https://microsoft.github.io/qdk-chemistry/>, so a local build or a copy of the
published site works. The default location is an `html` directory beside this
repo; pass `--docs` to point somewhere else, and `--course` to write elsewhere.

`rst_to_notebook.py` reconstructs each selected notebook and replaces its file;
it does not merge hand edits or retain outputs. When the generated cell sequence
and tags are unchanged, it preserves the existing cell IDs so learner progress
continues to refer to the same activities. It refuses a structural change unless
`--allow-cell-id-changes` is passed after reviewing the effect on learner
progress.

Use `--check` before write mode. It builds every selected notebook in memory,
reports changed fields by one-based cell number, and does not write files:

    python rst_to_notebook.py --docs <docs> --check

For review, generate into a temporary course directory containing a copy of
`course.json`, then compare the result before replacing the tracked notebooks:

    python rst_to_notebook.py --docs <docs> --course <temporary-course>
    python verify_course.py <temporary-course>

After intentional recipe changes, run the converter in write mode and then use
`bake_outputs.py` only for notebooks whose outputs should ship with the course.

Image assets stored beside `rst_to_notebook.py` are used in place of the ones
from the built documentation, and the converter embeds them in the notebooks.
Diagrams are SVG, embedded inline in the Markdown so they follow the active
theme. `tutorial_qpe_atomic_basis_functions.png` and
`tutorial_qpe_example_molecular_orbitals.png` stay PNG attachments. Every
figure needs an `:alt:`, which becomes the SVG's accessible name.

Each notebook ends with links to the neighbouring units. Unit order and titles
come from `course.json` and the notebook names from `RECIPES`, so the two must
list the same units; the converter stops if they disagree. The links point at
the learner's `*.workbook.ipynb` copies, which the extension materializes beside
the authored notebooks, so they only resolve inside a learner's workspace.

| Script               | What it does                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rst_to_notebook.py` | Reconstructs selected unit notebooks. `RECIPES` holds the per-chapter decisions a human still has to make; `--check` detects drift without writing. |
| `details_to_quiz.py` | Refreshes the saved outputs of a chapter's quiz cells. The quiz counterpart of `bake_outputs.py`; `--check` detects drift without writing.          |
| `bake_outputs.py`    | Runs a notebook so its outputs ship with the course.                                                                                                |
| `verify_course.py`   | Checks every unit loads, validates, and carries what the tree needs. Pass `--allow-outputs` when reviewing baked notebooks.                         |

## Self-check questions

`details_to_quiz.py` bakes the outputs of a chapter's quiz cells into the
notebook, so a learner sees the questions on opening the file and can answer
without a kernel. It is the quiz counterpart of `bake_outputs.py`, but a quiz is
pure data, so it calls the emitter directly instead of starting a kernel. It
only refreshes saved quiz outputs; it never creates quiz cells or changes their
source.

The questions are written by hand as `quiz(...)` definitions in `quiz`-tagged
cells of the author notebook, as described under
[Quizzes](../../../../authoring-courses.md#quizzes). Which wrong answers are
worth offering is a judgement about what a learner is likely to believe, so no
converter writes them. A learner's workbook shows only a `quiz("id")` call
rather than the answer key. The answers do travel to the browser inside the
baked cell output, because the renderer grades without a kernel — this raises
the effort of looking them up rather than making it impossible, and it is no
weaker than the collapsible answers it replaces.

After editing a question, rebake its output, or check for drift without writing:

    python details_to_quiz.py 06-iterative-phase-estimation
    python details_to_quiz.py 06-iterative-phase-estimation --check

`rst_to_notebook.py` doesn't know about quiz cells. Regenerating a chapter turns
its `quiz-question` admonitions back into `<details>` disclosures and drops the
quiz cells and the final `author-only` validation cell, so the converter treats
it as a structural change and refuses unless `--allow-cell-id-changes` is passed.
After such a regeneration, restore those cells from version control in place of
the `<details>` blocks, then rebake and verify:

    python details_to_quiz.py 06-iterative-phase-estimation
    python verify_course.py
