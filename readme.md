![Build status](https://github.com/DEFRA/fmp-app/actions/workflows/ci.yml/badge.svg)[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fmp-app&metric=alert_status)](https://sonarcloud.io/dashboard?id=DEFRA_fmp-app)[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fmp-app&metric=coverage)](https://sonarcloud.io/dashboard?id=DEFRA_fmp-app)

# Flood Map for Planning (FMP) App Front end application

This repository is part of the CYLTFR service which also includes:\
<https://github.com/DEFRA/fmp-riskadmin-api> - checks for holding comments and intersections\
<https://github.com/DEFRA/fmp-api> (private) - Deals with product 4s \
<https://github.com/DEFRA/fmp-api/admin> - Admin app to restart P4 jobs and frontend for querying db \
<https://github.com/DEFRA/fmp-api/riskadmin> - Frontend to upload shapefiles \
<https://github.com/DEFRA/fmp-service> - (no longer in use)\

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
| agolServiceUrl              | ESRI service API URL                    |   yes     |             |                             |       |
| vectorTileUrl               | Vector Tile URL                         |   yes     |             |                             |       |
| customerTeamEndPoint        | Customer Service query endpoint         |   yes     |             |                             |       |
| localAuthorityEndPoint      | LLFA query endpoint                     |   yes     |             |                             |       |
| isEnglandEndPoint           | Is in England endpoint                  |   yes     |             |                             |       |
| floodZonesRiversAndSeaEndPoint| Rivers and the sea endpoint           |   yes     |             |                             |       |
| floodZonesClimateChangeEndPoint| Climate change enpoint               |   yes     |             |                             |       |
| riversAndSeaDefendedEndPoint| Rivers and the sea, defended endpoint   |   yes     |             |                             |       |
| riversAndSeaUndefendedEndPoint| River and the sea, undefended endpoint|   yes     |             |                             |       |
| riversAndSeaDefendedCCP1EndPoint| Climate change, defended endpoint   |   yes     |             |                             |       |
| riversAndSeaUndefendedCCP1EndPoint| Climate change, undefended endpoint|   yes    |             |                             |       |
| surfaceWaterEndPoint        | Surface water endpoint                  |   yes     |             |                             |       |
| agolRofrsDepthOrExtents     | ESRI Rivers and Sea layers Depth or Extent|    no   | depth       |                             |       |
| eamapsServiceUrl            | EA ESRI Map server URL                  |   yes     |             |                             |       |
| eamapsProduct1User          | Internal user for product 1 map         |   yes     |             |                             |       |
| eamapsProduct1Password      | Internal user password for P1           |   yes     |             |                             |       |
| product1EndPoint            | P1 URL endpoint                         |   yes     |             |                             |       |
| tokenEndPoint               | Token generating for P1 endpoin         |   yes     |             |                             |       |
| layerNameSuffix             | Layer name to use on DEFRA map          |   yes     |             |_NON_PRODUCTION,_Tile_Layer  |       |
| build_map_as_submodule      | True will build the map component module|   yes     | false       |                             |       |
| riskAdminApiUrl             | Risk admin API URL                      |   yes     |             |                             |       |
| forceRiskAdminApiResponse   | Toggle mock risk admin API response     |   yes     | false       |                             |       |

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