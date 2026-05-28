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
4. `.env.example` dosyasini `.env` olarak kopyalayin ve tum placeholder degerleri kendi ortam/test hesap bilgilerinizle doldurun.
   ```bash
   cp .env.example .env
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
4. Copy `.env.example` to `.env`, then replace every placeholder with your target environment and test account values.
   ```bash
   cp .env.example .env
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

### GitHub Actions Reports
- Pushes and pull requests run the full Cucumber suite unless a manual workflow run provides a tag filter.
- GitHub Actions shows a readable E2E summary directly on the workflow run page.
- Pushes, scheduled runs, and manual runs publish the navigable HTML report to GitHub Pages.
- The full HTML report is also uploaded as the `e2e-cucumber-report-*` artifact.
- CI does not record videos. Videos are recorded only for local runs.

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
â”œâ”€â”€ .env                  # Local environment values (gitignored)
└── README.md             # This onboarding guide
```

---

## 📝 Writing New Tests / Yeni Test Ekleme

1. **Create a Feature**: Add a new Gherkin `.feature` file inside `e2e/features/` (e.g., `brand_analytics.feature`).
2. **Define steps**: Write scenario steps in English or Turkish utilizing standard Gherkin keywords (`Given`, `When`, `Then`, `And`).
3. **Map steps**: Add your matching step automation scripts in TypeScript inside `e2e/steps/` using Playwright's page fixture hooks.
