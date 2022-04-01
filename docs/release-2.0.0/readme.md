# FMP Release 2.0.0 6th April 2022

This is a flood map application and service update. It contains several UI changes and adds a new feature 
that enables a user to request a flood risk assessment report.

# Instructions

- Configure job 02_GEOSERVER

Ensure that the job is building from the */master branch of the fmp Gitlab repository.

- Execute job 02_GEOSERVER

This will build Geoserver with new print templates

- Configure job 03_APPS

Ensure that the job is building from the */production-v2 branch of the fmp-app repository.
Ensure that the job is building from the */production-v2 branch of the fmp-service repository.

- Execute job 03_APPS

Does a full code build to update the service to version 2.0.0 and an auto test run.