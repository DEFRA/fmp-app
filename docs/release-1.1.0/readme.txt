# FMP Release 1.1.0

# Information

The primary purpose of this release is to introduce the new boundary drawing tool to the map, along with the inclusion of the flood zones on the first map.

# Tickets
FLO-2866
FLO-2796
FLO-2800
FLO-2801
FLO-2822
FLO-2824
FLO-2882
FLO-2893
FLO-2771

# Webops

There are no data changes with this release.

A full code deployment needs to be completed.

The work required for FLO-2771 also needs to be introduced by webops, this involves the work around reducing the impact of the issue with pdf file descriptors.

Actions:

Cron script to restart the app servers instances of Tomcat every 48 hours on alternating days for each server.
Increase the config of the number of files that Tomcat can have open at one time.
