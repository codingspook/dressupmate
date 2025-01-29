# Instructions for Commits with GitHub Copilot

## Language Guidelines
- Always write commits in English
- Use present tense ("add" not "added")
- Be clear and concise
- Start with a verb (add, fix, update, remove, etc.)

## Initial Setup
1. Verifica l'installazione di GitHub Copilot in VSCode
2. Installa l'estensione "GitHub Copilot Labs" per funzionalità extra

## Quick Commands
- `Cmd + Shift + G` - Apri Source Control
- `Cmd + Enter` - Commit Changes
- `Cmd + I` - Attiva suggerimenti Copilot

## Commit Message Structure
```
<type>(<scope>): <description in English>

[body]

[footer]
```

### Commit Types
- `feat`: nuova feature
- `fix`: bugfix
- `docs`: documentazione
- `style`: formattazione
- `refactor`: refactoring
- `test`: test
- `chore`: manutenzione

### Practical Examples for Instabasic
```
feat(auth): add JWT authentication flow
fix(posts): resolve image loading issue
style(ui): align NextUI cards properly
docs(readme): update setup instructions
refactor(api): optimize post fetching logic
```

## Tips for Instabasic
- Use specific scopes: auth, posts, profile, ui
- Reference issue IDs: `fix #123`
- For related features use: `relates #123`
- Keep descriptions short and meaningful in English

## Workflow with Copilot
1. Stage modifiche (`+` in Source Control)
2. Premi `Cmd + I` nel campo commit
3. Seleziona/modifica il suggerimento di Copilot
4. Conferma con `Cmd + Enter`
