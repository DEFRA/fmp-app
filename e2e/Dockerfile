FROM mcr.microsoft.com/playwright:latest

WORKDIR /app

ENV PLAYWRIGHT_HTML_OPEN=never
ENV PLAYWRIGHT_HTML_OUTPUT_DIR=/app/playwright-report

COPY package*.json ./
RUN npm ci

COPY . .