# Release 0.0.4

# Jira tickets

Release ticket
https://eaflood.atlassian.net/browse/FLO-XXXX

Consisting of
https://eaflood.atlassian.net/browse/FLO-2140


# Config

No config changes

# Webops instructions

Geoserver update
----------------

The following .war file on S3 has been updated to include the [Geoserver Print Module extension](http://docs.geoserver.org/latest/en/user/extensions/printing/index.html)


https://s3-eu-west-1.amazonaws.com/ansible-flood-map-service/geoserver/geoserver_v2.9.1-print-2.11.2.war

This will need referencing in the ansible script.


The configuration on the extension lives in GEOSERVER_DATA_DIR/printing/config.yaml. There is a new counterpart config.yaml file stored in the https://gitlab-dev.aws-int.defra.cloud/flood/fmp repo.