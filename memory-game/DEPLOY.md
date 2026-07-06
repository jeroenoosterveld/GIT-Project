# Deployment (iPhone / GitHub Pages)

```bash
cd memory-game
npm run deploy:pages
```

## Updates zonder Safari-cache wissen

Gebruikers hoeven **niet** "Wis geschiedenis en websitedata" te gebruiken.

1. App opent → checkt `version.txt` op de server (altijd vers, `cache: no-store`)
2. Nieuwe versie? → banner **"Nieuwe versie beschikbaar — Bijwerken"**
3. Eén tik → app laadt de nieuwe versie
4. Offline spelen blijft werken — cache wordt niet gewist bij normaal gebruik

## Wat elke deploy doet

- Unieke versiestempel in `version.txt` en in de app
- `?v=` op JavaScript-bundle (alleen bij update)
- Service workers uitgeschakeld (die veroorzaken cache-problemen)

## URL

```
https://jeroenoosterveld.github.io/Memory-game/
```

Geen speciale link nodig — de app checkt zelf op updates.
