
## Plan: Componente Interactive cu Volum + Mod Ranked Fără Indicii

### Ce vom realiza

1. **Componente cu aspect 3D/volum** - fiecare componentă plasată va avea umbră, adâncime și poziționare clară (nu doar o imagine lipită)
2. **Animații de montare realistice** - când plasezi o componentă, aceasta "se fixează" în slot cu o animație de snap-in
3. **Componentă cu comportament propriu** - hover effects, stări vizuale diferite (montat/hovered/available)
4. **Mod Ranked fără indicii vizuale** - sloturile nu vor fi evidențiate, etichetele zonelor vor fi ascunse, provocare reală
5. **Integrare naturală** - componentele se aliniază perfect cu sloturile, folosind pozitionare precisă

---

### Partea 1: Componente Plasate cu Volum 3D

**Fișier nou: `src/components/game/PlacedComponent.tsx`**

O componentă dedicată pentru randarea componentelor plasate cu:

- **Umbră proiectată** - `box-shadow` și `drop-shadow` pentru efect de adâncime
- **Bordură subtilă** - margine care creează senzația de volum
- **Animație de montare** - scale + opacity la plasare
- **Glow specific componentei** - efecte neon bazate pe tipul piesei
- **Hover state** - informații suplimentare când treci cu mouse-ul

Exemplu vizual:
```text
┌─────────────────────┐  ← Bordură 3D subtilă
│  ╔═════════════╗    │
│  ║   CPU       ║    │  ← Imagine cu umbră
│  ║  [imagine]  ║ ──────→ Drop shadow
│  ╚═════════════╝    │
└─────────────────────┘
       │
       └── Glow neon la bază
```

---

### Partea 2: Animație de Snap-In la Plasare

**Fișier: `src/index.css`**

Adăugăm keyframes pentru animații realiste:

- `@keyframes snap-in` - componentă vine din afară și se fixează cu un mic bounce
- `@keyframes settle` - micro-ajustare după plasare
- `@keyframes glow-pulse` - pulsație subtilă când componenta e montată

**Fișier: `src/components/game/MotherboardSVG.tsx`**

Înlocuim simpla `<image>` cu un grup SVG care include:
- Umbră proiectată sub componentă
- Imagine componentă cu clip-path personalizat
- Efect de "seated" (componenta stă în slot, nu plutește)

---

### Partea 3: Mod Ranked - Fără Indicii Vizuale

**Fișier: `src/data/gameComponents.ts`**

Adăugăm proprietate nouă în `GAME_CONFIG`:
```text
ranked: {
  ...
  showZoneHints: false,    // Nu arăta evidențieri pe zone
  showZoneLabels: false,   // Nu arăta nume de zone
  showDropIndicators: false // Nu arăta "PLASEAZĂ AICI"
}
```

**Fișier: `src/components/game/GameBoard.tsx`**

Pasăm modul curent către `MotherboardSVG` și `DropZoneOverlay`:
```text
<MotherboardSVG
  ...
  gameMode={state.mode}
/>
<DropZoneOverlay
  ...
  gameMode={state.mode}
/>
```

**Fișier: `src/components/game/MotherboardSVG.tsx`**

Condiționăm afișarea:
- În mod Ranked: zonele goale nu au bordură dashed colorată, doar un contur foarte subtil
- În mod Ranked: nu afișăm etichetele zonelor ("Socket CPU", etc.)
- În mod Ranked: nu afișăm liniile indicatoare cu nume

**Fișier: `src/components/game/DropZoneOverlay.tsx`**

În mod Ranked:
- Nu afișăm overlay-ul "PLASEAZĂ AICI" deloc
- Nu afișăm evidențierea zonelor când tragi
- Doar feedback minim când drop-ul e valid/invalid

---

### Partea 4: Integrare Naturală - Poziționare Precisă

**Fișier: `src/components/game/MotherboardSVG.tsx`**

Îmbunătățim randarea componentelor plasate:

1. **Offset de adâncime** - componenta pare "în" slot, nu "peste"
2. **Mascare parțială** - clipPath care face componenta să arate inserată
3. **Contururi de slot vizibile parțial** - slotul rămâne vizibil sub componentă
4. **Orientare corectă** - RAM vertical, GPU orizontal, etc.

Exemplu pentru RAM:
```text
Înainte (imagine lipită):     După (integrată):
┌──────┐                      ▐██████▌
│ RAM  │   ←─ plutește        ▐██████▌  ←─ pare inserată
│      │                      ▐══════▌  ←─ slot vizibil
└──────┘                      
```

---

### Partea 5: Hover și Feedback pe Componente Plasate

**Fișier: `src/components/game/MotherboardSVG.tsx`**

Adăugăm interactivitate pentru componentele montate:
- Hover: componentă se luminează ușor + tooltip cu detalii
- Stare vizuală: "installed" badge
- Cursor: pointer când treci peste componentă montată

---

### Secțiune Tehnică

**Fișiere modificate:**

| Fișier | Modificări |
|--------|------------|
| `src/data/gameComponents.ts` | Adăugăm `showZoneHints`, `showZoneLabels`, `showDropIndicators` în config |
| `src/components/game/GameBoard.tsx` | Pasăm `gameMode` către componente copil |
| `src/components/game/MotherboardSVG.tsx` | (1) Primim prop `gameMode`, (2) Condiționăm afișare zone/etichete, (3) Randare componente 3D |
| `src/components/game/DropZoneOverlay.tsx` | (1) Primim prop `gameMode`, (2) Dezactivăm overlay în Ranked |
| `src/index.css` | Adăugăm animații snap-in, settle, glow-pulse |

**Flux vizual per mod:**

```text
TRAINING:
  ✓ Zone evidențiate cu culoare
  ✓ Etichete pe zone ("CPU Socket")
  ✓ "PLASEAZĂ AICI" indicator
  ✓ Linii indicatoare
  ✓ Feedback complet

CHALLENGE:
  ✓ Zone evidențiate
  ✓ Etichete vizibile
  ✗ "PLASEAZĂ AICI" mai subtil
  ✓ Feedback normal

RANKED:
  ✗ Zone fără evidențiere colorată
  ✗ Fără etichete pe zone
  ✗ Fără indicatoare
  ✗ Fără linii cu nume
  ✓ Doar feedback la drop (valid/invalid)
  = Dificultate maximă
```

**Efect 3D pentru componente:**

```text
SVG Structure pentru componentă plasată:
<g class="placed-component">
  <filter id="shadow-cpu">...</filter>     ← Umbră
  <rect fill="hsl(muted)" rx="4" />        ← Fundal slot
  <image href="cpu.png" filter="shadow" /> ← Imagine cu umbră
  <rect stroke="accent" fill="none" />     ← Bordură glow
  <text>✓ Mounted</text>                   ← Badge status
</g>
```

---

### Rezultat Final

- Componentele plasate vor avea **aspect 3D cu umbră și volum**
- **Animații de montare** realiste (snap-in cu bounce)
- În **modul Ranked**: nicio indicație vizuală - trebuie să știi unde merge fiecare piesă
- **Integrare naturală** - componentele par inserate în sloturi, nu lipite deasupra
- Experiență de **simulator**, nu de colaj de imagini
