# InfluencerPortal QA Automation Framework 🚀

This repository houses the standalone **Playwright + Cucumber (TypeScript)** BDD End-to-End (E2E) testing framework for the InfluencerPortal application. 

This framework operates completely independently from the main application codebase. QA engineers can write, maintain, and execute E2E test suites against **Staging**, **Pre-production**, or **Production** environments using standard Gherkin syntax (`.feature` files).

---

## 🇹🇷 Türkçe Kurulum & Kullanım Kılavuzu

### Gereksinimler
- **Node.js** (v18 or higher recommended)
- **npm** (comes packaged with Node.js)

### Kurulum Adımları
1. Bu test reposunu yerel makinenize klonlayın.
2. Gerekli bağımlılıkları yüklemek için terminalde aşağıdaki komutu çalıştırın:
   ```bash
   npm install
   ```
3. Playwright tarayıcı motorlarını indirmek ve kurmak için şu komutu çalıştırın:
   ```bash
   npx playwright install
   ```
4. Kök dizinde bulunan `.env.example` dosyasının bir kopyasını oluşturup adını `.env` olarak değiştirin:
   ```bash
   cp .env.example .env
   ```
5. `.env` dosyasını açıp test koşturmak istediğiniz hedef adresi (`BASE_URL`) ve varsa test hesap bilgilerini girin:
   ```env
   BASE_URL=https://staging.influencerportal.com
   ```

### Testleri Çalıştırma
- **Arka Planda (Headless - Önerilen / CI/CD):**
  ```bash
  npm run test:e2e
  ```
- **Tarayıcı Arayüzü ile (Headed - İzlemek İçin):**
  ```bash
  npm run test:e2e:headed
  ```
- **Yavaş Modda Adım Adım İzleme (Debugging):**
  ```bash
  npm run test:e2e:debug
  ```

---

## 🇺🇸 English Setup & Usage Guide

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes packaged with Node.js)

### Setup Steps
1. Clone this test repository to your local machine.
2. Run the following command in your terminal to install the test dependencies:
   ```bash
   npm install
   ```
3. Install the Playwright browser engines:
   ```bash
   npx playwright install
   ```
4. Create a copy of the `.env.example` file and name it `.env`:
   ```bash
   cp .env.example .env
   ```
5. Open your `.env` file and set your target `BASE_URL` (Staging, Pre-prod, or Production) alongside test account credentials:
   ```env
   BASE_URL=https://staging.influencerportal.com
   ```

### Running Tests
- **Headless Mode (Standard / CI/CD pipeline):**
  ```bash
  npm run test:e2e
  ```
- **Headed Mode (Visual browser execution):**
  ```bash
  npm run test:e2e:headed
  ```
- **Slow-Mo Debugging Mode (Slowed down for visual tracing):**
  ```bash
  npm run test:e2e:debug
  ```

---

## 📁 Repository Structure / Klasör Yapısı

```
qa-test-repository/
├── e2e/
│   ├── cucumber.mjs      # Cucumber runner and reporting configurations
│   ├── features/         # BDD Gherkin .feature specifications / Senaryolar
│   ├── steps/            # Cucumber Step Definitions / Adım Tanımları
│   ├── support/          # Playwright browser setups, hooks, and cleanups
│   └── utils/            # Helper utilities and shared assertions
├── playwright.config.ts  # Isolated Playwright browser configs
├── package.json          # Dedicated test dependencies
├── .env.example          # Baseline environment template
└── README.md             # This onboarding guide
```

---

## 📝 Writing New Tests / Yeni Test Ekleme

1. **Create a Feature**: Add a new Gherkin `.feature` file inside `e2e/features/` (e.g., `brand_analytics.feature`).
2. **Define steps**: Write scenario steps in English or Turkish utilizing standard Gherkin keywords (`Given`, `When`, `Then`, `And`).
3. **Map steps**: Add your matching step automation scripts in TypeScript inside `e2e/steps/` using Playwright's page fixture hooks.
