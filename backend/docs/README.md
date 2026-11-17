# Ali knowledge docs (RAG)

Drop resume files here. Ali reads **only** from this folder when answering.

## Supported files

| File | Purpose |
|------|---------|
| `resume.md` | Main editable resume (recommended) |
| `*.md` / `*.txt` | Extra notes Ali can cite |
| `*.pdf` | Optional PDF resume (also served at `/api/resume` if present) |

## How to update

1. Edit `resume.md` with Pratham’s latest details, **or**
2. Replace / add a PDF named `resume.pdf` (or any `*.pdf`) in this folder.
3. Restart the backend (or wait for the next cold start). The RAG index rebuilds on startup.

## Rules Ali follows

- Answers only from these docs
- Stays on-topic about Pratham
- Deflects general AI / unrelated questions as Pratham’s personal agent
