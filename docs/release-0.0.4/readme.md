# Release 0.0.4

PDF Download

# Jira tickets

Release ticket
https://eaflood.atlassian.net/browse/FLO-2683

Consisting of
https://eaflood.atlassian.net/browse/FLO-2140


# Config

No config changes

# Webops instructions

The instructions below have more detail but basically:

1. Update the Geoserver instance using the new .war file on S3 along with the new Geoserver data directory contained in the `fmp` repo on Gitlab.
2. Update the FMP-APP



The following .war file on S3 has been updated to include the [Geoserver Print Module extension](http://docs.geoserver.org/latest/en/user/extensions/printing/index.html)

https://s3-eu-west-1.amazonaws.com/ansible-flood-map-service/geoserver/geoserver_v2.9.1-print-2.11.2.war

This will need referencing in the ansible script and the Geoserver role will need running.


The configuration on the extension lives in GEOSERVER_DATA_DIR/printing/config.yaml.