# Expense Tracker

> Zaawansowana aplikacja webowa do zarządzania budżetem domowym, wspierana przez sztuczną inteligencję. Projekt składa się z frontendu (React + Vite) oraz backendu (Node.js + Express + Prisma) z bazą PostgreSQL (pgvector). Aplikacja posiada bezpieczną autoryzację JWT, zautomatyzowane potoki księgowania wydatków (n8n + AI, RPA) oraz autorski system scrapowania i semantycznego wyszukiwania promocji sklepowych.

---

## 🚀 Live Demo

Aplikacja jest wdrożona na platformie Vercel.

* **Frontend:** [https://expense-tracker-web-delta-seven.vercel.app](https://expense-tracker-web-delta-seven.vercel.app)
* **Backend API:** [https://expense-tracker-api-sooty.vercel.app](https://expense-tracker-api-sooty.vercel.app)

---

### 🤖 NAJNOWSZA FUNKCJONALNOŚĆ - Automatyczne przetwarzanie paragonów (AI + n8n)

Aplikacja posiada zautomatyzowany potok przetwarzania paragonów przesyłanych mailowo, bez konieczności ręcznego wprowadzania danych przez użytkownika. 

Instancja n8n jest wdrożona na darmowym planie platformy Render. Aby zapobiec usypianiu serwera, zewnętrzny Cron Job odpytuje instancję co 10 minut. Dzięki temu automatyzacja działa nieprzerwanie w tle i jest zawsze gotowa do odbioru nowych wiadomości.

#### Jak to działa:
1. **Odbiór maila**: Wyzwalacz IMAP nasłuchuje na dedykowanej skrzynce wiadomości z załączonymi zdjęciami paragonów.
2. **Pobranie kontekstu użytkownika**: n8n odpytuje zabezpieczony kluczem API endpoint `GET /api/categories/webhook`, pobierając listę kategorii przypisanych do nadawcy na podstawie jego adresu e-mail.
3. **Analiza multimodalna (Google Gemini)**: Model analizuje obraz paragonu, wyciąga datę, łączną kwotę, pozycje (czyszcząc nazwy ze śmieciowych kodów kasowych) oraz dopasowuje wydatek do istniejącej kategorii.
4. **Zapis do bazy**: Wygenerowany i sparsowany JSON trafia do zabezpieczonego kluczem API endpointa `POST /api/webhooks/receipts` (Prisma + PostgreSQL).

![Schemat przepływu n8n](./docs/n8n_workflow.png)

> Plik z definicją workflow do zaimportowania w n8n: [`automations/n8n-receipt-processing.json`](./automations/n8n-receipt-processing.json)

---

### 🧪 Przetestuj to samodzielnie na żywo!

Zachęcam do przetestowania tej automatyzacji. Cały proces zajmuje tylko chwilę:

1. **Załóż konto:** Wejdź na [https://expense-tracker-web-delta-seven.vercel.app](https://expense-tracker-web-delta-seven.vercel.app) i zarejestruj się, używając adresu e-mail, z którego będziesz wysyłać testowy paragon.
2. **Dodaj kategorię:** Zanim wyślesz maila, przejdź w aplikacji do zakładki **Kategorie** i dodaj nową kategorię (np. nazwę sklepu z paragonu, "Spożywcze", "Paliwo" itp.). Dzięki temu sztuczna inteligencja będzie wiedziała, do jakiej kategorii przypisać Twój wydatek (w przeciwnym razie wydatek zostanie dodany, ale bez przypisanej kategorii).
3. **Wyślij paragon:** Wyślij maila na dedykowany adres **`exp.tr.receipts@gmail.com`**, dodając w załączniku wyraźne zdjęcie dowolnego paragonu.
   > 💡 *Wskazówka: Aby filtry antyspamowe Google nie odrzuciły wiadomości, wpisz dowolny losowy temat oraz krótką treść maila (nie wysyłaj samego załącznika).*
4. **Sprawdź wynik:** Odczekaj chwilę, odśwież stronę i przejdź do zakładki **Zarządzaj wydatkami**. Gotowe! Wydatek został przeanalizowany przez AI i automatycznie dodany do Twojego konta.

---

### 🤖 Automatyczna weryfikacja wyciągów bankowych (RPA / UiPath)

Projekt zawiera dedykowany moduł Robotic Process Automation stworzony w UiPath. Pełni on rolę zautomatyzowanego audytora, który weryfikuje poprawność danych wprowadzonych do systemu (np. tych z n8n) z rzeczywistymi wyciągami bankowymi, wyłapując potencjalne błędy ludzkie.

#### Jak to działa:
1. **Logowanie API:** Bot wykonuje request POST do backendu, logując się na konto użytkownika i pobierając dynamiczny token JWT.
2. **Pobieranie Danych:** Wykonuje autoryzowane żądanie GET, pobiera listę wydatków i parsuje JSON.
3. **Odczyt Wyciągu:** Wczytuje plik `Statement.xlsx` z eksportem z banku.
4. **Walidacja in-memory (LINQ):** Za pomocą zapytań VB.NET/LINQ bot przetwarza dane w pamięci. Stosuje *Fuzzy Matching* porównując kwoty i kategorie bez obciążania API.
5. **Raportowanie:** Generuje wynikowy plik `Report.xlsx` ze statusem dla każdej transakcji (poprawne vs wymagające ręcznej weryfikacji).

**Repozytorium bota RPA:** Zobacz pełny kod oraz wideo demonstracyjne w osobnym repozytorium: [github.com/K-Piask/expense-tracker-reconciliation-rpa](https://github.com/K-Piask/expense-tracker-reconciliation-rpa)

---

### 🛒 Inteligentne wyszukiwanie promocji (Playwright + AI Embeddings)

Aplikacja posiada własny mechanizm śledzenia promocji w popularnym supermarkecie. Zamiast polegać na prostym dopasowywaniu słów kluczowych, system rozumie kontekst produktów dzięki zastosowaniu wyszukiwania semantycznego (wektorowego).

#### Jak to działa:
1. **Stealth Scraping (Playwright):** Dedykowany skrypt omija zabezpieczenia anty-botowe, symuluje ludzkie zachowanie (pauzy, losowe przewijanie) i obsługuje *Infinite Scroll*, aby wyciągnąć surowe dane o produktach, cenach i kaucjach z dynamicznie ładowanego DOM.
2. **Generowanie wektorów (Gemini API):** Pobrane dane są wysyłane do modelu `gemini-embedding-001`. AI zamienia nazwy produktów na wielowymiarowe wektory (embeddings), rozumiejąc ich znaczenie (np. wie, że "Kajzerka" i "Chleb" należą do kategorii pieczywa).
3. **Zapis do bazy (pgvector):** Wektory trafiają do bazy PostgreSQL wykorzystującej rozszerzenie `pgvector`. Skrypt synchronizacyjny dba o aktualność ofert, usuwając przeterminowane promocje.
4. **Semantyczne dopasowanie:** Podczas tworzenia listy zakupów lub sprawdzania wydatków, aplikacja dopasowuje promocyjne produkty do utworzonych przez Ciebie kategorii i automatycznie przypisuje im odpowiednie obrazy oraz tagi, nawet jeśli nazwy nie pokrywają się w 100%.

---

## ✨ Najważniejsze funkcjonalności

* Rejestracja i logowanie użytkowników
* Ochrona tras za pomocą JWT
* Dodawanie, edycja i usuwanie wydatków
* Filtrowanie wydatków po kategorii i zakresie dat
* Widok szczegółów wydatku
* Dodawanie i zarządzanie kategoriami
* Tworzenie i obsługa list zakupów
* Powiązanie listy zakupów z wydatkiem
* Wyszukiwanie promocji po nazwie produktu
* Semantyczne dopasowywanie promocji do kategorii, aby przyporządkować odpowiedni obraz kategorii
* Podsumowanie wydatków w bieżącym miesiącu

---

## 🛠 Stack technologiczny

| Warstwa | Technologie |
| :--- | :--- |
| **Frontend** | React, Vite, React Router, Fetch API |
| **Backend** | Node.js, Express, Prisma ORM, PostgreSQL, JSON Web Token, bcrypt |
| **Baza danych** | PostgreSQL (hostowana na platformie Neon), rozszerzenie `pgvector` |
| **Automatyzacja & RPA** | n8n, UiPath Studio, VB.NET, LINQ |
| **Dodatkowo** | Gemini API (vision & embeddingi), Scraper oparty o Playwright |

---

## 📁 Struktura projektu

| Folder | Opis |
| :--- | :--- |
| `backend/` | API, Prisma, routing, logika auth i promocji |
| `frontend/` | Aplikacja React |
| `scraper/` | Pobieranie promocji do pliku JSON |
| `docs/` | Screeny do README |
| `automations/` | Plik workflow n8n (JSON) |

---

## ⚙️ Uruchomienie lokalne

### Wymagania
* Node.js
* PostgreSQL
* Konto i klucz do Gemini API

### Backend
1. Wejdź do folderu `backend`.
2. Zainstaluj zależności (`npm install`).
3. Uzupełnij plik `.env` na podstawie `.env.example`.
4. Uruchom migracje Prisma (`npx prisma generate` / `npx prisma migrate dev`), jeśli są potrzebne.
5. Wystartuj serwer (`node src/server.js`).

### Frontend
1. Wejdź do folderu `frontend`.
2. Zainstaluj zależności (`npm install`).
3. Ustaw `VITE_API_URL` w pliku środowiskowym.
4. Uruchom aplikację Vite (`npm run dev`).

---

## 🔐 Zmienne środowiskowe

| Zmienna | Przeznaczenie |
| :--- | :--- |
| `DATABASE_URL` | Backend |
| `GEMINI_API_KEY` | Backend |
| `JWT_SECRET` | Backend |
| `SCRAPER_TARGET_URL` | Backend |
| `INTEGRATION_API_KEY` | Backend |
| `VITE_API_URL` | Frontend |

---

## ☁️ Deployment

Aplikacja jest wdrożona i działa na platformie Vercel. Posiada dwie osobne konfiguracje:
* `backend/vercel.json` - uruchamia API jako funkcję Node.js.
* `frontend/vercel.json` - obsługuje routing aplikacji SPA (rewrite na `index.html`).

---

## 🕷 Scraper promocji

Folder `scraper` służy do pobierania danych promocyjnych do pliku JSON. Następnie backendowy skrypt importu zapisuje pobrane promocje do bazy danych i generuje dla nich embeddingi, co umożliwia wyszukiwanie semantyczne.

---

## 📈 Plan rozwoju

* [x] Automatyczne dodawanie produktów do wydatku po zeskanowaniu zdjęcia paragonu (AI/OCR)
* [x] Zautomatyzowany audyt wprowadzonych danych z wyciągami bankowymi (RPA)
* [ ] Rozbudowa statystyk, wykresów wydatków oraz analityki zakupów
* [ ] Bardziej szczegółowe podsumowania miesięczne
* [ ] Automatyczne przenoszenie ceny przy imporcie z listy zakupów do wydatku (jeśli wybrano promocję)
* [ ] Dalsze usprawnianie mechanizmu wyszukiwania promocji
* [ ] Poprawa responsywności (RWD) i lepsze dostosowanie interfejsu do mniejszych ekranów
* [ ] Wprowadzenie testów jednostkowych

---

## 🎯 Cel projektu

Projekt powstał z dwóch głównych powodów - jako narzędzie użytkowe oraz kompleksowe ćwiczenie programistyczne.

**Cele praktyczne:**
* Usprawnienie kontroli nad domowym budżetem i monitorowanie wydatków.
* Ułatwienie codziennych zakupów dzięki zintegrowanym listom i wyszukiwarce promocji.

**Cele techniczne:**
* Budowa aplikacji fullstack od podstaw do wdrożenia.
* Projektowanie API REST oraz modelowanie relacji w bazie danych.
* Praca z autoryzacją (JWT) i integracja z zewnętrznym API (Gemini).
* Integracja wielosystemowa (Web + n8n + RPA).

---

## 📸 Przewodnik po aplikacji (Walkthrough)

**1. Ekran logowania**
![Login](docs/login.png)
*Dostęp do aplikacji jest zabezpieczony. Aby uzyskać wgląd do prywatnych danych finansowych, użytkownik musi się zalogować lub w przypadku pierwszej wizyty utworzyć nowe konto.*

**2. Pulpit główny i podsumowanie miesiąca**
![Home](docs/home.png)
*Po zalogowaniu wyświetla się czytelne podsumowanie bieżących wydatków, co ułatwia błyskawiczną kontrolę budżetu z poziomu ekranu głównego.*

**3. Wyszukiwarka promocji**
![Promotions](docs/promotions.png)
*Zintegrowana wyszukiwarka pozwala na szybkie weryfikowanie aktualnych promocji przed wyjściem do sklepu.*

**4. Listy zakupów**
![ShoppingLists](docs/shoppingLists.png)
*Moduł list zakupów ułatwia planowanie. Każdą wyprawę do sklepu możemy zorganizować wokół dedykowanej listy.*

**5. Szczegóły listy zakupów**
![ShoppingListDetails1](docs/shoppingListDetails1.png)
*W widoku szczegółów dodajemy produkty, które zamierzamy nabyć.*

![ShoppingListDetails2](docs/shoppingListDetails2.png)
*Przycisk „Wyświetl promocje” pozwala błyskawicznie sprawdzić, czy któryś z dodanych przez nas produktów jest aktualnie przeceniony.*

![ShoppingListDetails3](docs/shoppingListDetails3.png)
*Kliknięcie wybranej promocji przypisuje ją do produktu na liście. Dzięki temu podczas zakupów nie zapomnimy o specjalnej ofercie.*

![ShoppingListDetails4](docs/shoppingListDetails4.png)
*Podczas wizyty w sklepie można odznaczać zdobyte produkty, co natychmiast aktualizuje czytelny pasek postępu.*

**6. Kategorie**
![Categories](docs/categories.png)
*Przed dodaniem wydatków możemy zdefiniować własne kategorie (np. Supermarket, Restauracja, Stacja benzynowa), aby lepiej organizować i analizować finanse.*

**7. Lista wydatków i filtry**
![Expenses1](docs/expenses1.png)
*Centralne miejsce do zarządzania transakcjami. Tworząc nowy wydatek, możemy przypisać mu kategorię oraz zaimportować zrealizowaną listę zakupów (która po tym zabiegu automatycznie znika z aktywnych list, zyskując status zakończonej).*

![Expenses2](docs/expenses2.png)
*Rozbudowane filtry pozwalają w kilka sekund znaleźć wydatki z konkretnej kategorii lub wybranego przedziału czasowego.*

**8. Szczegóły wydatku**
![ExpenseDetails1](docs/expenseDetails1.png)
*W widoku szczegółowym nowo dodanego wydatku edytujemy koszty poszczególnych zaimportowanych produktów lub dopisujemy kolejne pozycje prosto z paragonu.*

![ExpenseDetails2](docs/expenseDetails2.png)
*Widok listy produktów po uzupełnieniu rzeczywistych kwot.*

![ExpenseDetails3](docs/expenseDetails3.png)
*Na dole prezentowana jest oryginalna, powiązana i zrealizowana lista zakupów.*