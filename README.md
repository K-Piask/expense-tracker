# Expense Tracker

> Aplikacja webowa do zarządzania wydatkami, ich kategoriami, listami zakupów i promocjami. Projekt składa się z frontendu w React + Vite oraz backendu w Node.js + Express + Prisma, z bazą PostgreSQL. Aplikacja posiada autoryzację JWT, obsługę kategorii, szczegółów wydatków, list zakupów oraz wyszukiwanie promocji.

---

## 🚀 Live Demo

Aplikacja jest wdrożona na platformie Vercel.

* **Frontend:** [https://expense-tracker-web-delta-seven.vercel.app](https://expense-tracker-web-delta-seven.vercel.app)
* **Backend API:** [https://expense-tracker-api-sooty.vercel.app](https://expense-tracker-api-sooty.vercel.app)

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
| **Baza danych** | PostgreSQL (hostowana na platformie Neon) |
| **Dodatkowo** | Gemini API (embeddingi), Scraper oparty o Playwright |

---

## 📁 Struktura projektu

| Folder | Opis |
| :--- | :--- |
| `backend/` | API, Prisma, routing, logika auth i promocji |
| `frontend/` | Aplikacja React |
| `scraper/` | Pobieranie promocji do pliku JSON |
| `docs/` | Screeny do README |

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
| `JWT_SECRET` | Backend |
| `GEMINI_API_KEY` | Backend |
| `SCRAPER_TARGET_URL` | Backend |
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

* Automatyczne dodawanie produktów do wydatku po zeskanowaniu zdjęcia paragonu (OCR)
* Rozbudowa statystyk, wykresów wydatków oraz analityki zakupów
* Bardziej szczegółowe podsumowania miesięczne
* Automatyczne przenoszenie ceny przy imporcie z listy zakupów do wydatku (jeśli wybrano promocję)
* Dalsze usprawnianie mechanizmu wyszukiwania promocji
* Poprawa responsywności (RWD) i lepsze dostosowanie interfejsu do mniejszych ekranów
* Wprowadzenie testów jednostkowych

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