# Release 0.0.4

# Jira tickets

Release ticket
https://eaflood.atlassian.net/browse/FLO-XXXX

Consisting of
https://eaflood.atlassian.net/browse/FLO-2140


# Config

There is an additional config key "printUrl"

# Webops instructions

Extract the contents of the geoserver-2.11.2-printing-plugin.zip archive into the /WEB-INF/lib/ in the GeoServer webapp. 
After extracting the extension, restart GeoServer in order for the changes to take effect.

On the first startup after installation, GeoServer should create a print module configuration file in GEOSERVER_DATA_DIR/printing/config.yaml.
Replace this file with the one in this directory.

If the module is installed and configured properly, then you will also be able to retrieve a list of configured printing parameters from http://localhost:8080/geoserver/pdf/info.json.
