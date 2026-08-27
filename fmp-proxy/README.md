# fmp-proxy

A lightweight Hapi proxy that keeps third-party mapping credentials server-side.

## What it provides

- `GET /health-check` simple service health probe
- `GET /os-token` retrieves an Ordnance Survey OAuth token (cached in memory)
- `GET|POST /proxy/os/{path*}` forwards to `https://api.os.uk/{path*}` with `Authorization: Bearer <token>` injected server-side
- `GET|POST /proxy/esri/{path*}` forwards to `agol.serviceUrl/{path*}` with query parameter `token=<short-lived AGOL token>` injected server-side

## Environment variables

Copy `.env.example` to `.env` and set real values.

- `FMPPROXYPORT` (default `3005`)
- `agolClientId` required
- `agolClientSecret` required
- `agolServiceId` required
- `ESRI_TOKEN_DURATION_MINUTES` optional (defaults to `7200`)
- `ordnanceSurveyOsGetCapabilitiesUrl` required (can be empty string)
- `ordnanceSurveyOsMapsUrl` required
- `ordnanceSurveyOsNamesUrl` required
- `ordnanceSurveyOsSearchKey` required (can be empty string)
- `ordnanceSurveyOsClientId` required
- `ordnanceSurveyOsClientSecret` required
- `OS_TOKEN_URL` optional (defaults to OS production token endpoint)

## Run locally

```bash
npm install
npm start
```

## Test

```bash
npm run test
```

## Contributing to this project

We do not expect contributions, however if you have something you'd like to contribute please log an issue.

## License
THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

>Contains public sector information licensed under the Open Government licence v3

### About the license
The Open Government Licence (OGL) was developed by the Controller of His Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
