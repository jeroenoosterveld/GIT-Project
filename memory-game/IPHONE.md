# Memory op je iPhone (zonder computer)

Geen Mac, geen server, geen Expo Go nodig. Je zet het spel op je **beginscherm** als app — en het werkt daarna **offline**.

Het spel staat al klaar op GitHub. Je hoeft alleen **GitHub Pages** aan te zetten (geen GitHub Actions nodig).

---

## Stap 1: Ga naar Pages-instellingen

Open in **Safari** op je iPhone:

**https://github.com/jeroenoosterveld/GIT-Project/settings/pages**

Log in op GitHub als dat nodig is.

> Zie je geen **Settings**? Tik op het **drie puntjes (⋯)** bovenaan en kies **Settings**.

---

## Stap 2: Kies de branch (niet GitHub Actions!)

Onder **Build and deployment**:

1. Bij **Source** (Bron): kies **Deploy from a branch**
   - *Niet* "GitHub Actions" — die optie hoef je niet te zoeken
2. Bij **Branch**:
   - Eerste keuzelijst: **`gh-pages`**
   - Tweede keuzelijst: **`/ (root)`**
3. Tik op **Save**

Even wachten (1–2 minuten). Vernieuw de pagina — je ziet dan een groene melding met de link naar je site.

---

## Stap 3: Open het spel

Ga in Safari naar:

**https://jeroenoosterveld.github.io/GIT-Project/**

---

## Stap 4: Zet op je beginscherm

1. Tik op het **deel-icoon** (vierkant met pijl omhoog) onderaan in Safari
2. Scroll en tik op **Zet op beginscherm**
3. Tik op **Voeg toe**

Je hebt nu een **Memory**-icoon op je homescherm.

---

## Offline spelen

- Open het spel **één keer met internet** (zodat alles geladen wordt)
- Daarna kun je het ook **zonder wifi** spelen

---

## Hulp nodig?

**Ik zie geen Settings**
→ Je moet ingelogd zijn als eigenaar van het project (jeroenoosterveld).

**Ik zie geen gh-pages branch**
→ Wacht even en vernieuw de pagina. De branch is al aangemaakt.

**De link werkt niet**
→ Wacht 2–5 minuten na Save en probeer opnieuw.

**Ik zie alleen GitHub Actions**
→ Scroll bij Source omhoog — kies **Deploy from a branch** in plaats van GitHub Actions.
