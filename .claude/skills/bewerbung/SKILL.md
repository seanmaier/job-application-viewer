---
name: bewerbung
description: Erstellt oder überarbeitet eine Bewerbung KI-gestützt über die /api/v1 der produktiven App - Stellenanzeige analysieren, passendes Basis-Profil wählen, Skills/Summary/Projekte anpassen, Anschreiben entwerfen und nach Bestätigung als Entwurf speichern. Erkennt wiederkehrende Muster und schlägt daraus neue Basis-Profile vor. Verwenden bei "/bewerbung", wenn der Nutzer eine Stellenanzeige (URL oder Text) für eine Bewerbung teilt, oder mit dem Argument "muster" für die reine Musteranalyse.
argument-hint: "<URL oder Text der Stellenanzeige> | muster"
---

# Bewerbung erstellen

Du arbeitest gegen die **produktiven Daten** des Nutzers. Lesen ist jederzeit erlaubt.
Jeder Schreibzugriff (`POST`, `PATCH`, `PUT`) braucht eine **ausdrückliche Bestätigung**
des konkreten Vorschlags in diesem Gespräch.

`$ARGUMENTS` ist die Stellenanzeige (URL oder Text). Bei `muster` springe direkt zu
**Musteranalyse**.

## Werkzeug

Alle Aufrufe laufen über den Client im Repo-Root (Token aus `.env.assistant`):

```bash
node scripts/api.ts GET me                          # Verbindung prüfen
node scripts/api.ts GET base-profiles
node scripts/api.ts GET applications
node scripts/api.ts GET applications/<id>
node scripts/api.ts POST applications <datei.json>
node scripts/api.ts PATCH applications/<id> <datei.json>
node scripts/api.ts POST base-profiles <datei.json>
node scripts/api.ts PUT base-profiles/<id> <datei.json>
```

- Pfade **ohne** führenden Slash (Git Bash würde `/applications` umschreiben).
- Request-Bodies immer mit dem Write-Tool als UTF-8-JSON ins Scratchpad schreiben und den
  Pfad übergeben, nie inline in der Shell.
- Bei `HTTP 400` stehen in `details` alle Validierungsfehler: korrigieren und erneut senden.
- Felder einer Bewerbung: `id, company, role, status, language, font, appliedDate,
  interviewDate, finalDecisionDate, notes, url, baseProfileId, summaryOverride,
  featuredProjectIds, skillGroupsOverride, coverLetter` (siehe `src/types.ts`).
  `PATCH` überschreibt nur die übergebenen Felder; `null` entfernt ein optionales Feld.
- Neue Bewerbungen bekommen serverseitig immer den Status `drafting`.

## Vorbereitung

1. `node scripts/api.ts GET me`. Schlägt das fehl: Fehlt `.env.assistant`, den Nutzer bitten,
   sie nach `.env.assistant.example` anzulegen und im Container
   `node server/cli.ts token-add <username> claude` auszuführen. Nicht weitermachen.
2. `private/knowledge/about-me.md` lesen. Fehlt die Datei oder ist sie größtenteils leer,
   darauf hinweisen und `/basiswissen` anbieten. Ohne Basiswissen nur mit den Daten aus
   dem Basis-Profil arbeiten und das im Ergebnis offen sagen.

## Ablauf

### 1. Stellenanzeige verstehen

URL über das Web-Fetch-Werkzeug lesen, Text direkt verwenden. Extrahieren:
Firma, Rolle, Sprache der Anzeige (`de`/`en`), Ansprechperson, Muss-Anforderungen,
Kann-Anforderungen, Aufgaben, Tech-Stack, Kultur-/Tonalitätssignale, Standort/Remote.
Passt die Stelle zu den Ausschlusskriterien im Basiswissen, das sofort ansprechen.

### 2. Aktuellen Stand laden

`GET base-profiles` und `GET applications`. Gibt es schon eine Bewerbung für dieselbe
Firma und Rolle, fragen, ob diese per `PATCH` überarbeitet werden soll, statt eine neue
anzulegen.

### 3. Passung analysieren

- Basis-Profil wählen: Sprache muss zur Anzeige passen, danach größte Überschneidung bei
  Skills, Projekten und Rolle. Die Wahl in einem Satz begründen.
- Jede Muss-/Kann-Anforderung einem Beleg zuordnen (Projekt, Station, Skill aus
  Basiswissen) oder als **Lücke** markieren.

### 4. Entwurf erstellen

- `skillGroupsOverride`: Gruppen und Skills nach Relevanz für die Stelle sortieren, Begriffe
  der Anzeige verwenden, wo sie dasselbe meinen. **Nur Skills, die im Basis-Profil oder
  Basiswissen belegt sind.** Lernende Skills als Gruppe mit `"variant": "learning"`.
- `summaryOverride`: 2–4 Sätze, auf die Rolle zugeschnitten.
- `featuredProjectIds`: 2–4 IDs aus `profile.projects` des gewählten Basis-Profils, die
  die wichtigsten Anforderungen belegen.
- `coverLetter`: `recipientOrg`, `recipientName` (nur wenn bekannt), `date` im Format der
  Sprache (z. B. `9. November 2026` / `November 9, 2026`), `subjectRole`, 3–5
  `paragraphs`, optional `closing`. Ton und Tabus aus dem Abschnitt „Schreibstil" des
  Basiswissens einhalten. Konkrete Belege statt Floskeln.
- `notes`: Kurzanalyse (Passung, Lücken, offene Fragen), damit sie in der App sichtbar ist.
- `url`: Link zur Anzeige. `id`: Slug aus Firma und Rolle, z. B. `acme-backend-engineer`.
- `language` und `baseProfileId` setzen.

### 5. Vorschlag zeigen und bestätigen lassen

Im Chat zeigen: Profilwahl mit Begründung, Tabelle Anforderung → Beleg, Lücken,
Summary, Skill-Reihenfolge, Projektauswahl, vollständiges Anschreiben. Änderungswünsche
einarbeiten, bis der Nutzer zustimmt. **Erst dann schreiben.**

### 6. Speichern

JSON ins Scratchpad schreiben, `POST applications` (bzw. `PATCH applications/<id>`).
Dem Nutzer die ID und den Link `<JOB_APPS_URL>/application/<id>` nennen. Status nie ändern,
außer der Nutzer verlangt es ausdrücklich.

### 7. Musteranalyse anschließen

Kurz die Musteranalyse durchführen und nur dann etwas sagen, wenn sie ein Muster findet.

## Musteranalyse

1. `GET applications` und `GET base-profiles`.
2. Bewerbungen nach `baseProfileId` und `language` gruppieren. Innerhalb einer Gruppe
   ähnliche Anpassungen suchen: gleiche Top-Skillgruppen, ≥ 70 % gemeinsame Skills in
   `skillGroupsOverride`, wiederkehrende Summary-Themen, dieselben `featuredProjectIds`.
3. Ein Muster gilt erst ab **3 Bewerbungen**, deren Anpassungen einander ähnlicher sind
   als dem Basis-Profil.
4. Vorschlag: neues Basis-Profil = Kopie des Ausgangsprofils mit den Konsens-Skillgruppen,
   einer Summary für diese Rollenart und der Projektreihenfolge des Musters. Name nach
   Rollenart und Sprache, z. B. „Backend (DE)". Zeigen, welche Bewerbungen das Muster
   bilden und was sich gegenüber dem Ausgangsprofil ändert.
5. Nach Bestätigung `POST base-profiles`. Danach anbieten, die betroffenen Bewerbungen per
   `PATCH` auf das neue Profil umzustellen (`baseProfileId`, und `skillGroupsOverride: null`,
   wenn die Anpassung dann identisch zum Profil wäre). Bereits versendete Bewerbungen
   (`sent` und später) nur auf ausdrücklichen Wunsch anfassen, weil sich sonst der
   Lebenslauf ändert, den das Unternehmen schon hat.

## Grundregeln

- Nichts erfinden: keine Skills, Zahlen, Projekte oder Abschlüsse, die nicht im
  Basis-Profil oder Basiswissen stehen. Lücken offen benennen und im Anschreiben nicht
  überspielen, sondern mit Lernbereitschaft und konkretem Bezug adressieren.
- Basis-Profile nie ungefragt per `PUT` ändern; Verbesserungen als Vorschlag zeigen.
- Neue Erkenntnisse über den Nutzer (z. B. Antworten auf Rückfragen) anbieten, ins
  Basiswissen zu übernehmen.
