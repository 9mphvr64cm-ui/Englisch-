# 30 Wörter täglich – Jahresversion

## Inhalt
- 365 Tage × 30 Wörter = 10,950 englische Wörter
- Start: 13.09.2026
- Letzter Kurstag: 12.09.2027
- Jeden Tag wird automatisch genau ein neues 30er-Paket freigeschaltet
- Karte antippen → drehen
- „Gewusst“ / „Nochmal“
- Wiederholungen nach 1 / 3 / 7 / 14 / 30 Tagen
- Lernrichtung Englisch→Deutsch, Deutsch→Englisch oder gemischt
- Archiv aller freigeschalteten Tage
- lokaler Lernstand + JSON-Backup
- als PWA auf dem iPhone installierbar
- Offline-Nutzung nach dem ersten Laden

## Übersetzungen
Die ersten 7 Tage haben feste deutsche Bedeutungen.
Für spätere Wörter wird die Übersetzung beim ersten Online-Aufruf über MyMemory geladen
und danach im Browser lokal gespeichert. Bereits geladene Übersetzungen funktionieren anschließend offline.

## GitHub Pages
1. ZIP entpacken.
2. Alle Dateien in ein öffentliches GitHub-Repository hochladen.
3. Repository → Settings → Pages.
4. Source: Deploy from a branch.
5. Branch: main, Folder: /(root).
6. Die veröffentlichte Seite in Safari öffnen.
7. Teilen → „Zum Home-Bildschirm“.

## Wichtiger Hinweis
Der Lernstand liegt lokal im Browser/iPhone. Deshalb gelegentlich unter „Daten“ ein Backup exportieren.

## Datenbasis
Die langfristige englische Rangfolge wurde aus der in TextBlob enthaltenen Häufigkeitsdatei erzeugt.
Sie basiert laut Dateikopf auf Public-Domain-Büchern sowie Frequenzlisten aus Wiktionary und dem British National Corpus.
Die ersten 500 extrem grundlegenden Formen werden für die automatisch erzeugte Langzeitliste als bereits bekannter Basiswortschatz übersprungen; die erste Woche ist bewusst alltagstauglich kuratiert. Korpusartefakte, viele Eigennamen, sehr seltene Einträge und einige ungeeignete Wörter wurden gefiltert.
