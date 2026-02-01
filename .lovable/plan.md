
## Redesenare Placă de Bază - Stil Schematic + Zoom Control

### Ce vom realiza
1. **Eliminarea limitării de lățime** - `#root` are în prezent `max-width: 1280px`, ceea ce blochează extinderea plăcii
2. **Placă de bază în stil schematic** - redesenată ca o diagramă tehnică cu linii, contururi și etichete clare (similar imaginii de referință), dar pe fundal dark cu accente neon
3. **Control de zoom** - slider interactiv pentru a regla mărimea plăcii (100%-200%)

---

### Partea 1: Eliminarea restricției de lățime

**Fișier: `src/App.css`**
- Ștergem sau modificăm regula `#root { max-width: 1280px; ... }` care blochează extinderea layout-ului

---

### Partea 2: Adăugare Zoom Control

**Fișier: `src/components/game/GameBoard.tsx`**
- Adăugăm un state `zoomLevel` (100-200, default 120)
- Adăugăm un slider sub titlul "Placă de Bază" pentru controlul zoom-ului
- Aplicăm `transform: scale(zoomLevel/100)` pe containerul SVG-ului

```text
┌─────────────────────────────────────────────────┐
│  Placă de Bază                                  │
│  ─────────────────────────────────────          │
│  Zoom: [────●────] 120%                         │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │                                         │    │
│  │         (Motherboard SVG)               │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

### Partea 3: Redesenare Motherboard SVG în Stil Schematic

**Fișier: `src/components/game/MotherboardSVG.tsx`**

Redesenăm complet placa de bază într-un stil "blueprint tehnic":

- **Fundal**: formă dreptunghiulară cu linii de circuit subtile
- **Contururi clare**: fiecare zonă (CPU, RAM, PCIe etc.) desenată cu linii punctate/dashed și etichetă
- **Etichete cu linii indicatoare**: linii care conectează componentele la nume (ca în imaginea de referință)
- **Culori neon**: păstrăm paleta dark cu accente cyan/green/purple pentru zone
- **Zone decorative**: I/O Ports, VRMs, Fan Headers, SATA, CMOS Battery - toate vizibile ca pe o schemă

Elemente noi adăugate:
- VRMs (zona de sus-stânga, lângă I/O)
- Fan Headers (sus-dreapta, jos-dreapta)
- USB Headers (2.0, 3.0)
- CMOS Battery
- System Panel Header
- PCIe x1 slots (sub x16)
- HD Audio Header

Stilizare:
- Linii indicatoare cu etichete în afara plăcii (stânga/dreapta)
- Borduri dashed pentru zone neocupate
- Borduri solide + glow pentru zone ocupate
- Text clar, font tehnic

---

### Partea 4: Actualizare Layout GameBoard

**Fișier: `src/components/game/GameBoard.tsx`**
- Containerul plăcii devine scrollabil pe overflow (pentru zoom mare)
- Zoom-ul se aplică cu `transform-origin: top center`
- Adăugăm butoane rapide: 100%, 150%, 200%

---

### Secțiune Tehnică

**Modificări principale:**

| Fișier | Acțiune |
|--------|---------|
| `src/App.css` | Eliminăm `max-width: 1280px` din `#root` |
| `src/components/game/GameBoard.tsx` | Adăugăm state zoom + slider + transform |
| `src/components/game/MotherboardSVG.tsx` | Redesenare completă stil schematic |

**Structura zoom:**
```text
zoomLevel state (100-200)
           ↓
     Slider control
           ↓
 transform: scale(zoomLevel/100)
           ↓
     Motherboard SVG
```

**Noi elemente decorative în SVG:**
- VRMs, USB 2.0/3.0 Headers, CMOS Battery, Audio Header, System Panel, PCIe x1 slots
- Linii indicatoare spre etichete externe

---

### Rezultat Final

- Placa de bază va arăta ca o **schemă tehnică de manual**
- Utilizatorul poate **regla zoom-ul** de la 100% la 200%
- Fără restricții de lățime - placa ocupă spațiul disponibil
- Tema dark cu accente neon păstrată
- Toate zonele de drop funcționale
