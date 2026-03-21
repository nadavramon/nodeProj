# NodeProj: Resilient Morning Email Scheduler ☀️

A sophisticated, modular Node.js background application that automatically aggregates weather data and exchange rates, formats them into a polished HTML digest, and delivers a daily update to your inbox precisely on schedule.

## 🏗️ Architecture & Philosophy

The application follows a **Research -> Strategy -> Execution** lifecycle, emphasizing a strict separation between business logic (Jobs) and infrastructure (Scheduler).

### Core Design Principles:
- **Dependency Injection**: Jobs are decoupled from their underlying services, making the logic highly testable and reusable.
- **Abstract Scheduling**: The scheduling engine is a generic driver that can execute any unit of work, allowing the application to scale horizontally with new automated tasks.
- **Resilience & Graceful Degradation**: Built with a "fail-soft" mindset. Uses `Promise.allSettled` to ensure that if one external API (e.g., Weather) is down, the user still receives the rest of their report (e.g., Exchange Rates).
- **Graceful Shutdown**: Listens for system signals (`SIGINT`) to stop all scheduled tasks and drain pending operations before exiting, preventing zombie processes.

## 📁 Project Structure

```text
src/
├── __test__/                  # Consolidated Vitest suite
├── configs/
│   └── app-config.js          # Declarative config with static defaults
├── scheduler/
│   ├── dailyReport/           # Encapsulated Daily Report logic
│   │   ├── daily-report.html  # Raw HTML email view
│   │   ├── dailyReport-job.js # Job orchestration logic
│   │   └── template.js        # Variable injection & lazy-loading logic
│   └── scheduler.js           # Abstract Infrastructure (node-cron driver)
├── services/                  # External integrations (API & SMTP)
│   ├── exchange-service.js    
│   ├── mailer-service.js      # SMTP verification & dispatch
│   └── weather-service.js
├── utils/                     # Shared low-level helpers
│   ├── dates/                 # Zoned time & interval utilities
│   ├── api-client.js          # Resilient fetch with retry logic
│   └── logger.js              # Centralized, leveled logging
└── index.js                   # Entry point with async initialization
```

## ⚙️ Configuration & Environment

The application uses a **hybrid configuration model**. Critical secrets are pulled from environment variables, while operational defaults are hardcoded for stability.

### Setup
Create a `.env.dev` (or `.env.prod`) file in the root directory:

```env
# ====== Required Secrets ======
USERNAME="your_email@gmail.com"
PASSWORD="your_app_specific_password"

# ====== Optional Overrides (Defaults exist in app-config.js) ======
# CRON_SCHEDULE="0 9 * * *"
# TIME_ZONE="Asia/Jerusalem"
# LOG_LEVEL="info"
```

> **Fast-Fail Validation:** On boot, `app-config.js` validates that all required secrets are present. If `USERNAME` or `PASSWORD` are missing, the app will throw an explicit error and refuse to start.

## 🚀 Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run in Development:**
    ```bash
    npm run dev
    ```

3.  **Execute Tests:**
    ```bash
    npm run test
    ```

4.  **Manual Trigger:**
    Use this to verify your SMTP and API settings immediately without waiting for the cron timer:
    ```bash
    npm run test-email
    ```

## 🧪 Testing Strategy

The project maintains a 100% success rate across a comprehensive Vitest suite. 

- **Unit Tests:** Utilities like date formatting and interval calculation are tested as pure functions.
- **Integration Tests:** The scheduling and job orchestration layers are tested using mocks for `node-cron`, `nodemailer`, and `fetch`, ensuring high-speed execution without side effects.
- **Mocking Strategy:** Uses `vi.mock` to isolate services and simulate network failures, retries, and successful data flows.

---
**Author:** Nadav Ramon | **License:** ISC
