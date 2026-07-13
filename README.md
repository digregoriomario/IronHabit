# IronHabit

IronHabit e una mobile app per organizzare esercizi, schede di allenamento, sessioni pianificate, allenamenti svolti e obiettivi personali. L'app funziona offline, e pensata per un singolo utente locale e salva tutti i dati sul dispositivo.

## Tecnologie

- React Native
- Expo SDK 54
- TypeScript
- React Navigation
- Zustand con middleware `persist`
- AsyncStorage
- NativeWind
- react-native-svg
- expo-audio per feedback sonori dei timer
- expo-haptics per feedback tattile

## Funzionalita principali

- CRUD completo di esercizi, schede, sessioni, storico allenamenti e obiettivi.
- Ricerca, filtri e ordinamento sulle principali sezioni.
- Configurazione iniziale al primo avvio con nome utente, tema e preferenze timer.
- Navigazione per Home, Schede, Esercizi, Storico e Obiettivi.
- Home con saluto personale, agenda dei prossimi giorni, stati delle sessioni e grafici di progresso essenziali.
- Schede con sessione libera e avvio dell'allenamento.
- Sessioni pianificate associate a una scheda, con piu sessioni possibili nello stesso giorno.
- Storico dedicato a consultazione, modifica, eliminazione, durata, volume, record e dettaglio delle serie.
- Obiettivi dedicati a frequenza settimanale, forza e ripetizioni, con avanzamento automatico dai workout completati.
- Persistenza locale JSON tramite AsyncStorage.
- Live workout persistente, minimizzabile e riprendibile.
- Timer di recupero automatico al completamento di ogni serie.
- Aggiunta, rimozione e riordino di esercizi e serie durante la sessione.
- Builder schede in stile Hevy con selezione multipla ordinata, filtro muscolare, note e target per singola serie.
- Campi serie adattivi per ripetizioni, carico, tempo e distanza in base all'esercizio.
- Recupero selezionabile da 30 secondi a 3 minuti con intervalli di 15 secondi.
- Creazione di schede dagli allenamenti storici.
- Superset, RPE, warm-up automatici, calcolo dischi e stima 1RM.
- Validazioni applicative per impedire dati incoerenti.
- Catalogo iniziale di esercizi base; schede, sessioni, storico e obiettivi restano contenuti creati dall'utente.

## Struttura del progetto

```text
src/
  domain/          entita e costanti
  usecases/        regole di business, validazioni e statistiche
  infrastructure/  adapter di persistenza locale
  presentation/
    components/    componenti UI riutilizzabili
    hooks/         hook per timer e cronometro
    navigation/    configurazione React Navigation
    screens/       schermate dell'app
    store/         Zustand store persistente
    theme/         palette e configurazioni UI
    utils/         helper di formattazione e data
```

La struttura segue un'organizzazione ispirata alla Onion Architecture: la logica del dominio e dei casi d'uso non dipende dalle schermate, mentre la UI usa store e use case attraverso azioni applicative.

## Requisiti

- Node.js LTS installato
- npm installato
- Expo Go installato su Android o iOS

Non e necessario installare Expo globalmente: i comandi usano `npx expo`.

## Installazione

Dalla cartella `IronHabit`:

```bash
npm run setup
```

Lo script esegue una installazione pulita rimuovendo `node_modules`, poi installa tutte le dipendenze.

## Avvio

```bash
npm run start
```

Il comando avvia Expo:

```bash
npx expo start
```

Quando compare il QR code, aprire Expo Go sul dispositivo fisico e scansionarlo. Il dispositivo e il computer devono essere sulla stessa rete.

## Script completo Windows PowerShell

Copiare ed eseguire dalla cartella `IronHabit`:

```powershell
$ErrorActionPreference = "Stop"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js non trovato. Installa Node.js LTS e riprova."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Error "npm non trovato. Verifica l'installazione di Node.js."
}

if (-not (Test-Path "package.json")) {
  Write-Error "package.json non trovato. Esegui lo script dalla cartella IronHabit."
}

if (-not (Test-Path "node_modules")) {
  npm run setup
}

npx expo start -c
```

Versione gia inclusa nel repository:

```powershell
.\scripts\start.ps1
```

## Script completo macOS Bash/Zsh

Copiare ed eseguire dalla cartella `IronHabit`:

```bash
#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js non trovato. Installa Node.js LTS e riprova." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm non trovato. Verifica l'installazione di Node.js." >&2
  exit 1
fi

if [ ! -f "package.json" ]; then
  echo "package.json non trovato. Esegui lo script dalla cartella IronHabit." >&2
  exit 1
fi

if [ ! -d "node_modules" ]; then
  npm run setup
fi

npx expo start -c
```

Versione gia inclusa nel repository:

```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

## Problemi comuni

- QR code non rilevato: verificare che computer e telefono siano sulla stessa rete Wi-Fi.
- Cache Metro incoerente: eseguire `npx expo start -c`.
- Dipendenze mancanti: eseguire `npm run setup`.
- Porta occupata: Expo propone automaticamente una porta alternativa.
- Audio non riprodotto: verificare volume del dispositivo e permessi audio; la vibrazione resta disponibile come feedback.

## Persistenza locale

I dati sono salvati in formato JSON tramite Zustand persist e AsyncStorage. Sono persistiti esercizi, schede, sessioni pianificate, allenamenti svolti, obiettivi e impostazioni. Non sono presenti backend o database relazionali.

## Conformita alla traccia

La corrispondenza tra requisiti progettuali e flussi implementati e documentata in [`docs/requirements-checklist.md`](docs/requirements-checklist.md).
