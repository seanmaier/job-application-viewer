---
name: bewerbung
description: Erstellt oder überarbeitet eine Bewerbung KI-gestützt über die /api/v1 der produktiven App - Stellenanzeige analysieren, passendes Basis-Profil wählen, Skills/Summary/Projekte anpassen, Anschreiben entwerfen und nach Bestätigung als Entwurf speichern. Erkennt wiederkehrende Muster und schlägt daraus neue Basis-Profile vor, und räumt überflüssige Basis-Profile in den Papierkorb. Verwenden bei "/bewerbung", wenn der Nutzer eine Stellenanzeige (URL oder Text) für eine Bewerbung teilt, mit dem Argument "muster" für die reine Musteranalyse oder "aufraeumen" zum Aufräumen der Basis-Profile.
argument-hint: "<URL oder Text der Stellenanzeige> | muster | aufraeumen"
---

# Bewerbung erstellen

Du arbeitest gegen die **produktiven Daten** des Nutzers. Lesen ist jederzeit erlaubt.
Jeder Schreibzugriff (`POST`, `PATCH`, `PUT`, `DELETE`) braucht eine **ausdrückliche
Bestätigung** des konkreten Vorschlags in diesem Gespräch.

`$ARGUMENTS` ist die Stellenanzeige (URL oder Text). Bei `muster` springe direkt zu
**Musteranalyse**, bei `aufraeumen` zu **Aufräumen**.

## Werkzeug

Alle Aufrufe laufen über den Client im Repo-Root (Token aus `.env.assistant`):

```bash
node scripts/api.ts GET me                          # Verbindung prüfen
node scripts/api.ts GET base-profiles
node scripts/api.ts GET applications
node scripts/api.ts GET applications/<id>
node scripts/api.ts POST applications <datei.json>
node scripts/api.ts PATCH applications/<id> <datei.json>
node scripts/api.ts GET applications/<id>/versions          # Versionsverlauf, neueste zuerst
node scripts/api.ts POST base-profiles <datei.json>
node scripts/api.ts PUT base-profiles/<id> <datei.json>
node scripts/api.ts DELETE base-profiles/<id>               # nur Papierkorb (Soft Delete)
node scripts/api.ts POST base-profiles/<id>/restore         # aus dem Papierkorb holen
node scripts/api.ts GET "base-profiles?trash=true"          # Basis-Profile im Papierkorb
node scripts/api.ts GET "applications?trash=true"           # Bewerbungen im Papierkorb
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
- Listen enthalten nichts aus dem Papierkorb. Dinge im Papierkorb lassen sich nicht ändern
  (`409`). Bewerbungen löscht nur der Nutzer in der App; dafür gibt es keinen API-Aufruf.

## Vorbereitung

1. `node scripts/api.ts GET me`. Schlägt das fehl: Fehlt `.env.assistant`, den Nutzer bitten,
   sie nach `.env.assistant.example` anzulegen; den Token erstellt er in der App unter
   **account → API tokens**. Bei `HTTP 401` ist der Token ungültig oder widerrufen.
   Nicht weitermachen.
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
Immer ein Feld `changeMessage` mitschicken: ein Satz, was und warum geändert wurde, z. B.
`"Summary auf DevOps zugeschnitten, Kubernetes ergänzt, PHP entfernt"`. Es erscheint im
Versionsverlauf der Bewerbung (Button **History** im Editor), über den der Nutzer jede
Änderung nachvollziehen und rückgängig machen kann.
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

## Aufräumen

Ziel: überflüssige Basis-Profile in den Papierkorb legen, damit die Liste übersichtlich
bleibt. Der Server löscht Profile im Papierkorb nach 7 Tagen endgültig; bis dahin kann der
Nutzer sie in der App unter **trash** (oder du per `restore`) zurückholen.

1. `GET base-profiles`, `GET applications` und `GET "base-profiles?trash=true"`.
2. Kandidaten bestimmen. Ein Profil ist überflüssig, wenn **keine** Bewerbung es nutzt
   (`baseProfileId`) und mindestens eins zutrifft:
   - inhaltlich (nahezu) identisch mit einem anderen Profil derselben Sprache,
   - durch ein neueres Profil für dieselbe Rollenart ersetzt (z. B. nach einer Musteranalyse),
   - leer oder offensichtlich ein Test (kein Name, keine Stationen, Platzhaltertexte).

   Die Standardprofile `default-en`/`default-de` nur vorschlagen, wenn es für dieselbe
   Sprache ein anderes vollständiges Profil gibt.
3. Kandidaten als Liste zeigen: Name, ID, Sprache, Begründung. Bei Unsicherheit lieber
   nicht vorschlagen.
4. Nach Bestätigung je Profil `DELETE base-profiles/<id>`. Antwortet der Server mit
   `409`, nutzen Bewerbungen das Profil noch (stehen in `applications`): dem Nutzer
   anbieten, sie per `PATCH` auf ein anderes Profil umzustellen, und erst danach erneut
   löschen. Versendete Bewerbungen (`sent` und später) nur auf ausdrücklichen Wunsch
   umstellen.
5. Zum Schluss nennen, was im Papierkorb liegt und wann es endgültig gelöscht wird
   (`purgesAt`).

Endgültig löschen kann nur der Nutzer selbst in der App. Bittet er dich darum, auf den
Button **delete permanently** im Papierkorb verweisen.

## Grundregeln

- Nichts erfinden: keine Skills, Zahlen, Projekte oder Abschlüsse, die nicht im
  Basis-Profil oder Basiswissen stehen. Lücken offen benennen und im Anschreiben nicht
  überspielen, sondern mit Lernbereitschaft und konkretem Bezug adressieren.
- Basis-Profile nie ungefragt per `PUT` ändern; Verbesserungen als Vorschlag zeigen.
- Neue Erkenntnisse über den Nutzer (z. B. Antworten auf Rückfragen) anbieten, ins
  Basiswissen zu übernehmen.
