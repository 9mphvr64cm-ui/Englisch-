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

## Aussprache (Version 3)
- Lautsprecher auf Vorder- und Rückseite jeder Karte
- englische Aussprache wahlweise British English (`en-GB`) oder American English (`en-US`)
- deutsche Aussprache mit `de-DE`
- drei Sprechgeschwindigkeiten: langsam, Lerntempo, normal
- vorhandene englische Beispielsätze können ebenfalls vorgelesen werden
- die App nutzt die auf dem Gerät verfügbaren Web-Speech-/Systemstimmen und speichert keine 10.950 Audiodateien

### Update einer bereits installierten GitHub-Pages-Version
Die neuen Dateien einfach in dasselbe Repository hochladen und die alten Dateien ersetzen. Der Service Worker hat eine neue Cache-Version. Nach der Veröffentlichung die App einmal komplett schließen und erneut öffnen; falls die alte Version noch sichtbar ist, Safari einmal neu laden und die App danach erneut starten.


## Version: Audio + Beispielsatz auf Abruf
- Vorderseite bleibt zunächst bewusst minimal.
- Aussprache ist über den Lautsprecher-Button jederzeit abrufbar.
- „💡 Beispielsatz“ blendet den englischen Beispielsatz erst auf Wunsch ein.
- Bei Deutsch→Englisch wird das gesuchte englische Wort im Hinweissatz ausgeblendet.
- Nach dem Umdrehen bleibt der vollständige Beispielsatz sichtbar und kann vorgelesen werden.


## Wörterbuch-Audio und Beispielsätze auf Abruf
- Englische Wörter: versucht zuerst eine echte Audioaufnahme aus Free Dictionary API.
- Falls keine Aufnahme vorhanden ist, verwendet die App automatisch die iPhone-Sprachausgabe.
- Deutsche Bedeutungen: iPhone-Sprachausgabe (de-DE).
- Beispielsätze werden nur auf Wunsch geladen und danach lokal im App-Speicher zwischengespeichert.
- Bei Deutsch→Englisch wird das Zielwort im Hinweis ausgeblendet.
- Für einzelne Wörter stellt das Wörterbuch möglicherweise keinen Beispielsatz oder keine Audioaufnahme bereit; dann greift die jeweilige Fallback-Logik.

## Version 6 – robustere Offline-/Fallback-Logik
- Englische Aussprache nutzt sofort die Systemstimme des iPhones und hängt nicht mehr vom Online-Wörterbuch ab.
- Fehlgeschlagene Wörterbuchabfragen werden nicht mehr als leere Ergebnisse gespeichert.
- Beispielsätze können nach einer Störung erneut geladen werden; falls vorhanden, wird eine englische Definition als Zwischenlösung gezeigt.
- Übersetzungen werden mit Timeout und bis zu drei Versuchen geladen.
- Tagesübersetzungen werden im Hintergrund nacheinander vorgeladen, um API-Drosselung zu vermeiden.
- Tag 8–10 enthalten Übersetzungen und Beispielsätze direkt in der App.

## Version 7 – Kommunikations- und Einsatzwortschatz
- Tag 1–7 bleiben unverändert, damit bisheriger Lernfortschritt erhalten bleibt.
- Ab Tag 8 wurde die Roh-Korpusliste ersetzt.
- Priorität 1: häufiges internationales Alltags- und Kommunikationsenglisch (Gespräch, Reisen, Arbeit, Orientierung, Gesundheit, Technik, Problemlösung).
- Priorität 2: ein kompakter Fachwortschatz für Polizei, internationale Spezialeinheiten und Militär.
- Professionelle Begriffe sind Sprachvokabular; die App vermittelt keine taktischen Verfahren.
- Flexionsformen werden möglichst auf Grundformen zusammengeführt; unnötige Eigennamen und stark literarische/medizinische Korpusartefakte wurden gefiltert.
