![Build status](https://github.com/DEFRA/fmp-app/actions/workflows/ci.yml/badge.svg)[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fmp-app&metric=alert_status)](https://sonarcloud.io/dashboard?id=DEFRA_fmp-app)[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fmp-app&metric=coverage)](https://sonarcloud.io/dashboard?id=DEFRA_fmp-app)

# Flood Map for Planning (FMP) App Front end application

This repository is part of the CYLTFR service which also includes:\
<https://github.com/DEFRA/fmp-riskadmin-api>\
<https://github.com/DEFRA/fmp-api> (private)\
<https://github.com/DEFRA/fmp-service>\
<https://github.com/DEFRA/fmp-admin>

## Prerequisites
Node v18.x\

### Install packages

`npm i`

### Build app

`npm run build`

### Start app

`npm start`

### Test app

`npm test`

# Environment variables
| name                        |      description                        | required  |   default   |            valid            | notes |
|-----------------------------|-----------------------------------------|:---------:|-------------|:---------------------------:|-------|
| ENV                         | Node environment                        |   yes     |             | local,development,test,pre-prod,production | |
| fmpAppType               | App user type                              |   yes     |             | internal,public             |       |
| PORT                        | Server port #                           |   yes     | 3000        |                             |       |
| viewsIsCached               | If true the views of pages are cached   |   yes     |             |                             |       |
| analyticsAccount            | GA ID                                   |   yes     | false       |                             |       |
| logLevel                    | Alter which logs are visible            |    no     | error       |                             |       |
| googleVerification         | GA verification hash key                 |   yes     |             |                             |       |
| fpAppId                     |                                         |   yes     |             |                             |       |
| httpTimeoutMs               | Timeout in ms                           |   yes     |             |                             |       |
| ordnanceSurveyOsGetCapabilitiesUrl | Flood warning API                |   yes     |             |                             |       |
| ordnanceSurveyOsNamesUrl    | OS Names API                            |   yes     |             |                             |       |
| ordnanceSurveyOsMapsUrl     | OS map API                              |   yes     |             |                             |       |
| ordnanceSurveyOsSearchKey   | OS search key                           |   yes     |             |                             |       |
| ordnanceSurveyOsClientId    | OS map key                              |   yes     |             |                             |       |
| ordnanceSurveyOsClientSecret| OS map secret key                       |   yes     |             |                             |       |
| placeApiUrl                 | OS places API                           |   yes     |             |                             |       |
| siteUrl                     | The apps URL                            |   yes     |             |                             |       |
| functionAppUrl              | A URL to the App                        |   yes     |             |                             |       |
| agolClientId                | ESRI Client ID                          |   yes     |             |                             |       |
| agolClientSecret            | ESRI Client Secret                      |   yes     |             |                             |       |
| agolServiceId               | ESRI service ID                         |   yes     |             |                             |       |
| eamapsServiceUrl            | EA ESRI Map server URL                  |   yes     |             |                             |       |
| eamapsProduct1User          | Internal user for product 1 map         |   yes     |             |                             |       |
| eamapsProduct1Password      | Internal user password for P1           |   yes     |             |                             |       |
| layerNameSuffix             | Layer name to use on map                |   yes     |             |_NON_PRODUCTION,_Tile_Layer  |       |
| build_map_as_submodule      | True will build the map component module|   yes     | false       |                             |       |
| riskAdminApiUrl             | Risk admin API URL                      |   yes     |             |                             |       |
| forceRiskAdminApiResponse   | Toggle mock risk admin API response     |    no     | false       |                             |       |

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