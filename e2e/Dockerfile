FROM mcr.microsoft.com/playwright:v1.58.2

WORKDIR /app

ENV PLAYWRIGHT_HTML_OPEN=never
ENV PLAYWRIGHT_HTML_OUTPUT_DIR=/app/playwright-report

COPY package*.json ./
RUN npm ci

COPY playwright.config.js environments.js fixtures.js ./
COPY tests/ tests/
COPY pages/ pages/
COPY test-runner-api/ test-runner-api/
COPY data/ data/
COPY utils/ utils/

RUN mkdir -p /app/test-results /app/playwright-report && chown -R pwuser:pwuser /app

USER pwuser