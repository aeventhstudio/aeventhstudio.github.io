# aeventhstudio.com

Website von AEventh Studio (GitHub Pages, Domain `aeventhstudio.com`).

| Pfad | Inhalt | Quelle |
| --- | --- | --- |
| `/` | Studio-Startseite | dieses Repo |
| `/impressum/`, `/datenschutz/` (später `/presse/`) | Studio-Seiten | dieses Repo |
| `/survival/` | Spielseite und `tools/` | **nur** aus `aeventhstudio/survival` → `Web/public/`, veröffentlicht mit `Web/deploy_web.sh` |

Regeln:
- Jeder Ordner hat genau eine Quelle. Den Ordner `survival/` hier nie direkt bearbeiten, er wird beim Deploy komplett ersetzt.
- Pfade sind endgültig (GitHub Pages kann nicht weiterleiten). Neues Spiel = neuer Ordner `/<spiel>/` mit eigenem Repo.
- Englisch ist Standard, weitere Sprachen dynamisch per JavaScript (Auswahl im Browser unter `aeventh_lang`).
- Versionsnummer der Startseite im Footer (MAJOR.MINOR.PATCH).
- Gemeinsames Aussehen der Studio-Seiten: `assets/site.css` und `assets/site.js` (Sprachen EN/DE, RU/KZ als Platzhalter; dunkler Boden mit Licht). Schriften lokal in `assets/fonts/` (SIL OFL), nichts von fremden Servern.
