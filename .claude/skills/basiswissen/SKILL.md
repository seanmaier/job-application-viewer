---
name: basiswissen
description: Baut das persönliche Basiswissen für KI-gestützte Bewerbungen auf oder ergänzt es (private/knowledge/about-me.md) - liest die vorhandenen Basis-Profile über /api/v1 und interviewt den Nutzer gezielt zu Projekten, Erfahrung, Skill-Niveaus und Schreibstil. Verwenden bei "/basiswissen", wenn der Nutzer sein Basiswissen pflegen will, oder wenn /bewerbung meldet, dass es fehlt oder lückenhaft ist.
argument-hint: "[optional: Abschnitt oder Projekt, das ergänzt werden soll]"
---

# Basiswissen aufbauen

Ziel ist `private/knowledge/about-me.md` (gitignored). Die Datei ist die Grundlage für
`/bewerbung`: Je konkreter die Belege, desto besser die Anschreiben. `$ARGUMENTS` kann
einen Abschnitt oder ein Projekt nennen, auf das du dich beschränkst.

## Ablauf

1. **Datei anlegen oder lesen.** Fehlt `private/knowledge/about-me.md`, aus
   `private/knowledge/about-me.example.md` kopieren (Hinweisblock am Anfang entfernen).
2. **Vorhandene Daten einlesen.** `node scripts/api.ts GET base-profiles` (siehe Skill
   `bewerbung` zur Einrichtung) und, falls vorhanden, `private/profiles/*.json`. Daraus
   vorbefüllen, was sich ableiten lässt: Stationen, Projekte mit ihrer `id`, Skills,
   Ausbildung. Für jedes Projekt im Basis-Profil einen Abschnitt mit der passenden `id`
   anlegen.
3. **Lücken bestimmen.** Pro Abschnitt prüfen, was fehlt. Priorität:
   1. Projekte: Problem, eigene Rolle, Entscheidungen, Ergebnis mit Zahlen
   2. Berufserfahrung: konkrete Ergebnisse
   3. Skill-Niveaus (verhindert Übertreibung in Bewerbungen)
   4. Schreibstil und Tabus
   5. Suchkriterien und Ausschlusskriterien
4. **Interview.** Pro Runde höchstens 3–4 konkrete Fragen zu **einem** Thema stellen,
   z. B. „Bei <Projekt>: Was war die schwierigste technische Entscheidung, und wie viele
   Nutzer hat es?" Keine allgemeinen Fragen wie „Erzähl mir von dir". Antworten nach jeder
   Runde sofort in die Datei schreiben, in den Worten des Nutzers, nur sprachlich
   geglättet.
5. **Abschließen**, wenn der Nutzer aufhören will oder die Prioritäten 1–4 gefüllt sind.
   Kurz zusammenfassen, was ergänzt wurde und was noch offen ist.

## Regeln

- Nichts erfinden oder ausschmücken. Unbekanntes als `offen` markieren.
- Ergeben sich Verbesserungen für ein Basis-Profil (z. B. ein Projekt fehlt dort oder eine
  Beschreibung ist schwach), als Vorschlag zeigen und nur nach Bestätigung per
  `node scripts/api.ts PUT base-profiles/<id> <datei.json>` speichern. Der Body enthält
  `name`, `language` und das **vollständige** `profile`.
- Die Datei enthält persönliche Daten: nie committen, nie an externe Dienste senden.
