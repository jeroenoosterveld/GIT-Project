# Deployment (iPhone / GitHub Pages)

Na **elke wijziging**:

```bash
cd memory-game
npm run deploy:pages
```

Dit gebeurt **automatisch** bij elke push via GitHub Actions.

## Cache-busting (altijd actief)

Elke build forceert een verse versie op iPhone:

1. **Unieke versiestempel** — datum/tijd + git-commit (elke deploy anders)
2. **URL redirect** — pagina zonder `?v=` wordt automatisch doorgestuurd
3. **localStorage-check** — oude versie → cache wissen + herladen
4. **version.txt-check** — vergelijkt met server (`cache: no-store`)
5. **Query params** — JS, manifest, icoon krijgen allemaal `?v=...`
6. **Service workers** — altijd uitgeschakeld en gewist
7. **Meta no-cache** — Safari krijgt geen-cache headers

Gebruikers hoeven **niet handmatig** cache te wissen — de app doet dit zelf bij openen.

## Live URL

```
https://jeroenoosterveld.github.io/Memory-game/
```

De `?v=` parameter wordt **automatisch** toegevoegd.

Versienummer staat onderaan in de app én in `version.txt` op de server.
