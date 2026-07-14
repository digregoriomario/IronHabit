# Revisione relazione tecnica IronHabit

> Stato verificato il 14/07/2026 sul repository corrente, includendo le modifiche locali non ancora committate.
>
> Controlli eseguiti: `npm run typecheck` superato; controllo TypeScript con `--noUnusedLocals --noUnusedParameters` superato; `npx expo install --check` superato; `expo-doctor` superato con 18/18 controlli.

## Priorità 0 — Correzioni bloccanti prima della consegna

- [ ] **Inserire le otto schermate finali reali**

  **Problema:** nelle pagine PDF 16–19, corrispondenti alle pagine fisiche 17–20, compaiono otto riquadri “Immagine da inserire”. L'ultimo percorso, relativo a `Impostazioni.png`, rompe anche l'impaginazione. Una relazione finale non deve contenere segnaposto.

  **File da preparare:**

  - `images/schermate-finali/configurazione-iniziale.png`
  - `images/schermate-finali/home.png`
  - `images/schermate-finali/schede.png`
  - `images/schermate-finali/esercizi.png`
  - `images/schermate-finali/storico.png`
  - `images/schermate-finali/obiettivi.png`
  - `images/schermate-finali/workout-guidato.png`
  - `images/schermate-finali/impostazioni.png`

  **Nota per le nuove catture:** la Home deve mostrare il logo aggiornato e le metriche `Workout`, `Schede` e `Obiettivi`; la schermata del workout deve mostrare durata, volume, serie completate, pulsanti elimina/completa, timer e tipi di serie; le impostazioni devono mostrare soltanto i temi Chiaro e Scuro.

  **Codice TeX — sostituire integralmente la sottosezione `Schermate finali dell'app`:**

  ```tex
  \subsection{Schermate finali dell'app}

  \begin{figure}[H]
  \centering
  \begin{minipage}[t]{0.38\textwidth}
    \centering
    \includegraphics[width=\linewidth,height=15.5cm,keepaspectratio]
      {images/schermate-finali/configurazione-iniziale.png}
    \caption*{Configurazione iniziale}
  \end{minipage}
  \hfill
  \begin{minipage}[t]{0.52\textwidth}
    \centering
    \includegraphics[width=\linewidth,height=15.5cm,keepaspectratio]
      {images/schermate-finali/home.png}
    \caption*{Home, riepilogo e agenda settimanale}
  \end{minipage}
  \end{figure}

  \clearpage
  \begin{figure}[H]
  \centering
  \begin{minipage}[t]{0.52\textwidth}
    \centering
    \includegraphics[width=\linewidth,height=15.5cm,keepaspectratio]
      {images/schermate-finali/schede.png}
    \caption*{Elenco e gestione delle schede}
  \end{minipage}
  \hfill
  \begin{minipage}[t]{0.38\textwidth}
    \centering
    \includegraphics[width=\linewidth,height=15.5cm,keepaspectratio]
      {images/schermate-finali/esercizi.png}
    \caption*{Catalogo degli esercizi}
  \end{minipage}
  \end{figure}

  \clearpage
  \begin{figure}[H]
  \centering
  \begin{minipage}[t]{0.45\textwidth}
    \centering
    \includegraphics[width=\linewidth,height=15.5cm,keepaspectratio]
      {images/schermate-finali/storico.png}
    \caption*{Storico degli allenamenti}
  \end{minipage}
  \hfill
  \begin{minipage}[t]{0.45\textwidth}
    \centering
    \includegraphics[width=\linewidth,height=15.5cm,keepaspectratio]
      {images/schermate-finali/obiettivi.png}
    \caption*{Obiettivi personali}
  \end{minipage}
  \end{figure}

  \clearpage
  \begin{figure}[H]
  \centering
  \begin{minipage}[t]{0.45\textwidth}
    \centering
    \includegraphics[width=\linewidth,height=15.5cm,keepaspectratio]
      {images/schermate-finali/workout-guidato.png}
    \caption*{Allenamento guidato}
  \end{minipage}
  \hfill
  \begin{minipage}[t]{0.45\textwidth}
    \centering
    \includegraphics[width=\linewidth,height=15.5cm,keepaspectratio]
      {images/schermate-finali/impostazioni.png}
    \caption*{Impostazioni}
  \end{minipage}
  \end{figure}
  ```

- [ ] **Rendere robusto il comando `\safeimage`**

  **Problema:** quando manca un'immagine, il riquadro creato dal comando attuale supera la larghezza disponibile a causa di bordo e spaziatura. La compilazione di controllo ha rilevato diversi `Overfull \hbox`, fino a circa 39 pt.

  **Codice TeX — sostituire la definizione attuale di `\safeimage`:**

  ```tex
  \newcommand{\safeimage}[3]{%
    \IfFileExists{#3}{%
      \includegraphics[width=#1,height=#2,keepaspectratio]{#3}%
    }{%
      \fcolorbox{irongray}{ironlight}{%
        \begin{minipage}[c]
          [\dimexpr#2-2\fboxsep-2\fboxrule\relax]
          [c]
          {\dimexpr#1-2\fboxsep-2\fboxrule\relax}
          \centering
          \textbf{Immagine mancante}\\[0.25cm]
          \small\path{#3}
        \end{minipage}%
      }%
    }%
  }
  ```

  **Verifica:** ricompilare e controllare che nel log non compaiano `Overfull \hbox` nelle figure. Per la versione da consegnare, comunque, nessuna immagine finale deve passare dal ramo “Immagine mancante”.

## Priorità 1 — Allineamento con l'app aggiornata

- [ ] **Aggiornare l'Executive summary e correggere gli errori grammaticali iniziali**

  **Problema:** il testo contiene `un architettura`, `progettuale,la` e `memrizzazione`; inoltre non cita le nuove modalità di tracciamento e la metrica Schede presente nella Home.

  **Codice TeX — sostituire i tre paragrafi della sezione `Executive summary`:**

  ```tex
  \section{Executive summary}
  IronHabit è un'applicazione mobile dedicata alla pianificazione, all'esecuzione e al monitoraggio degli allenamenti. Il progetto riunisce in un unico ambiente il catalogo degli esercizi, la creazione delle schede, la pianificazione settimanale delle sessioni, l'allenamento guidato, lo storico e gli obiettivi personali. L'app è pensata per un singolo utente locale, non richiede la creazione di un account, funziona senza backend e conserva i dati direttamente sul dispositivo.

  Il prototipo è sviluppato con React Native, Expo e TypeScript. Il codice è organizzato secondo un'architettura a livelli ispirata alla Onion Architecture: tipi ed entità del dominio sono separati dai casi d'uso, dalla persistenza e dall'interfaccia. Zustand raccoglie lo stato condiviso e le operazioni applicative; il middleware di persistenza salva in formato JSON esercizi, schede, sessioni, allenamenti, obiettivi, impostazioni e l'eventuale allenamento attivo tramite AsyncStorage.

  L'app comprende una configurazione iniziale, un catalogo di dodici esercizi di base, otto modalità di tracciamento, la costruzione di schede con target specifici per ogni serie, la pianificazione delle sessioni e una modalità di allenamento guidato. Il workout attivo può essere ridotto e ripreso senza perdere i valori inseriti; il completamento di una serie avvia il timer di recupero. Lo storico permette di consultare e modificare gli allenamenti salvati, confrontarli nel tempo e creare una nuova scheda a partire da un workout precedente. La Home mostra il numero di workout, schede e obiettivi attivi, il volume settimanale, lo stato delle sessioni e l'agenda della settimana.
  ```

- [ ] **Descrivere le otto modalità di tracciamento degli esercizi**

  **Problema:** la relazione parla genericamente di carico, ripetizioni, durata e distanza, ma l'app ora distingue esplicitamente otto modalità e tratta in modo diverso peso corporeo, zavorra e assistenza.

  **Codice TeX — aggiungere dopo RF01 oppure dopo `Organizzazione dei dati`:**

  ```tex
  \paragraph{Modalità di tracciamento degli esercizi.}
  Ogni esercizio utilizza una delle otto modalità di tracciamento disponibili:
  \begin{itemize}
    \item carico e ripetizioni;
    \item ripetizioni a corpo libero;
    \item corpo libero con zavorra;
    \item corpo libero assistito;
    \item durata;
    \item durata e carico;
    \item distanza e durata;
    \item distanza e carico.
  \end{itemize}
  La modalità scelta determina i campi mostrati nella scheda, nel workout guidato e nella modifica dello storico. Per gli esercizi zavorrati il carico viene presentato con segno positivo, mentre per quelli assistiti rappresenta il peso dell'assistenza.
  ```

  **Codice TeX — sostituire la descrizione di RF01:**

  ```tex
  RF01 & Gestione esercizi & L'utente può visualizzare, creare, modificare ed eliminare gli esercizi. Per ogni esercizio può inserire descrizione, muscoli coinvolti, difficoltà, attrezzatura, ripetizioni consigliate, durata, note e una delle otto modalità di tracciamento supportate. & 1 & \textcolor{orange}{Medio}\\
  ```

- [ ] **Documentare il nuovo livello automatico delle schede e i vincoli sulle serie**

  **Problema:** il livello della scheda non è più scelto liberamente tra `Starter`, `Intermedio` e `Intenso`. Viene calcolato come `Base`, `Intermedio` o `Avanzato` dalla difficoltà media degli esercizi. Sono inoltre presenti limiti e controlli più precisi sui target.

  **Codice TeX — aggiungere nella sottosezione `Validazione e integrità`:**

  ```tex
  \item una scheda può contenere al massimo 40 esercizi e ogni esercizio può contenere al massimo 40 serie;

  \item il livello della scheda viene calcolato automaticamente dalla difficoltà media degli esercizi inclusi: \textit{Base}, \textit{Intermedio} o \textit{Avanzato}; i vecchi valori \textit{Starter} e \textit{Intenso} vengono normalizzati per mantenere compatibili i dati già salvati;

  \item i valori obbligatori dipendono dalla modalità di tracciamento: le ripetizioni devono essere intere e positive, durata e distanza devono essere positive e i valori numerici rispettano limiti massimi di sicurezza;

  \item il recupero deve essere compreso tra 30 e 180 secondi e può essere configurato a intervalli di 15 secondi;

  \item una serie di riscaldamento può comparire soltanto prima delle serie allenanti; se viene spostata dopo una serie normale, drop set o failure, viene normalizzata automaticamente come serie normale;
  ```

  **Modifica aggiuntiva:** sostituire ogni eventuale riferimento a `Starter`/`Intenso` con `Base`/`Avanzato`. `Intermedio` resta invariato.

- [ ] **Correggere la descrizione degli obiettivi di frequenza**

  **Problema:** l'app non conta genericamente il numero di workout settimanali. Conta i giorni distinti, dal lunedì alla domenica, in cui è stato completato almeno un workout; più workout nello stesso giorno valgono come un solo giorno.

  **Codice TeX — sostituire il punto `Obiettivi` negli scenari d'uso:**

  ```tex
  \item \textbf{Obiettivi:} l'utente crea obiettivi relativi ai giorni di allenamento nella settimana, al carico o alle ripetizioni. Per la frequenza vengono contati i giorni distinti, dal lunedì alla domenica, nei quali è presente almeno un workout completato; per carico e ripetizioni viene considerato il record dell'esercizio selezionato.
  ```

  **Codice TeX — sostituire RF05:**

  ```tex
  RF05 & Gestione obiettivi & L'utente può visualizzare, creare, modificare ed eliminare obiettivi relativi ai giorni di allenamento nella settimana, al carico o alle ripetizioni. I progressi vengono ricalcolati automaticamente dai workout completati; più workout nello stesso giorno incrementano di una sola unità l'obiettivo settimanale. & 2 & \textcolor{orange}{Medio}\\
  ```

  **Codice TeX — aggiungere in `Statistiche e indicatori`:**

  ```tex
  Per gli obiettivi di frequenza settimanale il progresso non corrisponde al numero totale di workout, ma al numero di date distinte comprese tra il lunedì e la domenica nelle quali è stato completato almeno un allenamento.
  ```

- [ ] **Rimuovere il tema automatico di sistema dalla relazione**

  **Problema:** il codice corrente espone soltanto `Chiaro` e `Scuro`; il valore `system` non fa più parte di `UserSettings` e i vecchi valori diversi da `light` vengono normalizzati a `dark`.

  **Codice TeX — sostituire il paragrafo in `Scelta dei colori e del tema`:**

  ```tex
  Nel tema chiaro lo sfondo principale è bianco, mentre card, bordi e aree secondarie utilizzano grigi molto chiari. Nel tema scuro vengono utilizzati sfondi quasi neri e testi chiari, in modo da mantenere un buon contrasto. L'utente può scegliere esplicitamente tra tema chiaro e tema scuro durante la configurazione iniziale e nelle impostazioni. La versione attuale non applica automaticamente il tema del sistema operativo.
  ```

  **Codice TeX — sostituire la riga relativa a `src/presentation/theme/`:**

  ```tex
  \texttt{src/presentation/theme/} & Contiene le palette, le variabili grafiche e la logica necessaria ad applicare il tema chiaro o scuro selezionato dall'utente.\\
  ```

- [ ] **Aggiornare la descrizione della Home**

  **Problema:** la Home ora mostra il logo coerente con il tema e tre metriche rapide (`Workout`, `Schede`, `Obiettivi`), oltre a volume settimanale, sessioni per stato e agenda navigabile.

  **Codice TeX — sostituire l'ultimo paragrafo di `Statistiche e indicatori`:**

  ```tex
  Nella versione attuale, la Home mostra il logo coerente con il tema selezionato, il numero di workout completati, il numero di schede e gli obiettivi attivi. Sono inoltre presenti il grafico del volume della settimana corrente, il riepilogo delle sessioni pianificate suddivise per stato e un'agenda settimanale navigabile. Dalla Home l'utente può creare, aprire, modificare, avviare o eliminare le sessioni quando lo stato e la data lo consentono. Nelle schermate di dettaglio degli esercizi e degli allenamenti vengono invece mostrati record, stima dell'1RM e confronti con i risultati precedenti.
  ```

- [ ] **Aggiornare la descrizione dell'allenamento guidato**

  **Problema:** la relazione non descrive le nuove informazioni e azioni visibili nel live workout: durata trascorsa, volume, serie completate, eliminazione esplicita, completamento esplicito, badge dei tipi di serie e timer disponibile anche nel mini-player.

  **Codice TeX — inserire prima del paragrafo sul calcolo della durata:**

  ```tex
  L'intestazione del workout guidato espone le azioni per ridurre, eliminare o completare l'allenamento. Un riepilogo aggiornato in tempo reale mostra la durata trascorsa, il volume delle serie completate e il rapporto tra serie completate e serie totali. Ogni serie può essere contrassegnata come normale, riscaldamento, drop set o failure; nell'interfaccia i tipi speciali sono identificati rispettivamente dai badge \texttt{W}, \texttt{D} e \texttt{F}.

  Quando il workout viene ridotto, il mini-player mostra il nome dell'allenamento e, a seconda dello stato, il tempo trascorso oppure il conto alla rovescia del recupero. Da questo elemento è possibile riprendere o eliminare la sessione attiva. Il termine del timer viene controllato a livello di navigazione, così il feedback sonoro o aptico può essere emesso anche quando il workout è ridotto, purché l'app sia in esecuzione.
  ```

- [ ] **Rendere precisa la distinzione tra feature parziali e sviluppi futuri**

  **Problema:** superset e RPE sono già presenti nel modello e nel form di modifica dello storico; i superset sono visibili anche nel dettaglio delle schede e dei workout. Non sono però configurabili nel workout guidato. Le funzioni di warm-up automatico e calcolo dischi esistono nel livello dei casi d'uso, ma non sono collegate alle schermate.

  **Codice TeX — sostituire i due punti relativi a queste feature nella sottosezione `Funzionalità considerate ma non implementate completamente`:**

  ```tex
  \item configurazione completa di superset e RPE nel workout guidato: entrambi sono presenti nel modello; superset e RPE sono modificabili nello storico, mentre i gruppi superset sono mostrati anche nei dettagli. Il live workout non espone ancora questi due campi;

  \item generazione automatica delle serie di riscaldamento e calcolo dei dischi: le funzioni di supporto sono presenti nei casi d'uso, ma non sono collegate all'interfaccia e non vengono considerate feature consegnate. È invece già possibile impostare manualmente una serie come riscaldamento, purché preceda le serie allenanti;
  ```

  **Codice TeX — sostituire l'ultimo paragrafo delle conclusioni:**

  ```tex
  Gli sviluppi futuri potranno completare l'integrazione di superset e RPE nel workout guidato, collegare all'interfaccia la generazione automatica dei riscaldamenti e il calcolo dei dischi, aggiungere l'eliminazione dei workout salvati e introdurre una suite di test automatici. Ulteriori estensioni possibili sono esportazione e backup, notifiche locali e sincronizzazione cloud, mantenendo una modalità offline affidabile.
  ```

## Priorità 2 — Correzioni linguistiche e logiche puntuali

- [ ] **Correggere il paragrafo `Problema affrontato`**

  **Codice TeX — sostituire il paragrafo:**

  ```tex
  Durante un allenamento l'utente deve ricordare la scheda, i valori della volta precedente, i tempi di recupero e gli obiettivi da raggiungere. Usare strumenti separati aumenta il rischio di perdere informazioni o di registrarle in modo non uniforme. IronHabit collega invece la pianificazione all'esecuzione reale: una scheda può essere programmata in una data, trasformata in una bozza di workout, completata serie per serie e infine salvata nello storico. I dati registrati vengono poi utilizzati per aggiornare obiettivi, volume, record e confronti temporali.
  ```

- [ ] **Correggere lo scenario `Configurazione iniziale`**

  **Codice TeX — sostituire il punto:**

  ```tex
  \item \textbf{Configurazione iniziale:} al primo avvio l'utente inserisce il proprio nome, sceglie il tema chiaro o scuro e configura il feedback sonoro, la vibrazione e il tempo di recupero predefinito.
  ```

- [ ] **Correggere la sezione `Limitazioni note`**

  **Codice TeX — sostituire l'intero elenco:**

  ```tex
  \begin{itemize}
    \item il profilo è singolo e locale; la disinstallazione o la cancellazione dei dati dell'app elimina l'archivio;
    \item non esistono sincronizzazione tra dispositivi, esportazione o backup automatico;
    \item lo storico non espone ancora il comando per eliminare definitivamente un workout salvato;
    \item una sessione libera viene pianificata con titolo e note, mentre gli esercizi vengono scelti dopo l'avvio del workout;
    \item il timer è affidabile durante l'uso dell'app, ma non è implementato come servizio nativo e il suo funzionamento in background non è garantito;
    \item date e orari dipendono dalle impostazioni del dispositivo e non sono gestiti scenari con più fusi orari;
    \item le statistiche sono interne all'applicazione e non costituiscono indicazioni mediche o prescrizioni di allenamento;
    \item non è ancora presente una suite completa di test automatici per i casi d'uso e l'interfaccia.
  \end{itemize}
  ```

- [ ] **Correggere gli accenti nelle stringhe descrittive della relazione**

  **Modifica:** usare `difficoltà`, `intensità`, `giù`, `già`, `è obbligatorio` e `può` nel testo italiano. Nei blocchi di codice mantenere invece le stringhe esattamente come sono nel repository, anche quando non usano caratteri accentati.

## Priorità 3 — Verifica finale della relazione

- [ ] **Aggiornare la sezione dei controlli tecnici con l'esito corrente**

  **Codice TeX — aggiungere alla fine di `Controlli eseguiti`:**

  ```tex
  Alla verifica finale del 14 luglio 2026, entrambi i controlli TypeScript sono terminati senza errori, le dipendenze sono risultate allineate alla versione di Expo utilizzata e \texttt{expo-doctor} ha superato 18 controlli su 18.
  ```

- [ ] **Ricompilare due volte il documento**

  ```bash
  pdflatex -interaction=nonstopmode Relazione_Tecnica_IronHabit.tex
  pdflatex -interaction=nonstopmode Relazione_Tecnica_IronHabit.tex
  ```

- [ ] **Controllare il log LaTeX**

  ```bash
  rg -n "Overfull|Underfull|LaTeX Warning|^!" Relazione_Tecnica_IronHabit.log
  ```

- [ ] **Controllare visivamente tutte le pagine del PDF**

  - nessun riquadro `Immagine da inserire` o `Immagine mancante`;
  - nessun percorso file visibile;
  - nessun testo tagliato o sovrapposto;
  - didascalie coerenti con le schermate;
  - indice e numeri di pagina aggiornati;
  - logo e screenshot coerenti con il tema e con la versione corrente dell'app.

## Parti già coerenti — non modificare senza necessità

- [x] React Native `0.81.5`, Expo SDK `54`, TypeScript `5.9`, Zustand `5`, AsyncStorage `2.2` e `react-native-svg 15.12` corrispondono al progetto corrente.
- [x] Le cinque tab principali sono ancora Home, Schede, Esercizi, Storico e Obiettivi.
- [x] La chiave di persistenza è ancora `ironhabit-storage-v4`.
- [x] `partialize` salva esercizi, schede, sessioni, workout, obiettivi, impostazioni e workout attivo.
- [x] L'app resta locale, offline, senza autenticazione, backend o database relazionale.
- [x] L'eliminazione di un workout già salvato non è ancora implementata.
- [x] Il timer non è un servizio nativo in background.
- [x] Non è presente una suite completa di test automatici.
