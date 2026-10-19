# Coding standards

How code is written in this repo. Domain vocabulary and architecture conventions live in `GLOSSARY.md`.

## Comments

A comment carries the non-obvious _why_: a constraint, a workaround (with its cause or upstream link), an invariant. One or two lines.

- Clear code stands alone: names and types say _what_ it does, so a comment never restates it.
- In JSX, structure reads from component names and props; `{/* … */}` is for non-obvious behaviour only (e.g. the contact form honeypot).

## JSX layout

- Sibling JSX elements sit on consecutive lines; structure comes from component decomposition and indentation.
