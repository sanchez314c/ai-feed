# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities to @spacewelder314 via GitHub security advisories.

**Please do not report security vulnerabilities through public GitHub issues.**

## What to Include

When reporting a vulnerability, please include:

- Type of issue (e.g., XSS, SQL injection, API key exposure)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue

## Response Timeline

- We will acknowledge receipt within 48 hours
- We will provide a detailed response within 7 days
- We will work on a fix and release it as soon as possible

## API Key Security

This application requires API keys for various services. Please ensure:

- Never commit API keys to the repository
- Use environment variables or .env files (which are gitignored)
- Rotate keys regularly
- Use minimal required permissions for each key

## Data Privacy

- All data is stored locally in SQLite database
- No user tracking or analytics
- API keys are only used for configured services
- No data is shared with third parties beyond configured APIs

## Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations
- Only interact with their own accounts or test data
- Do not exploit discovered vulnerabilities
- Report issues responsibly

Thank you for helping keep theFEED secure!