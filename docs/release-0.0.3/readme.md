# Release 0.0.3

# Features that are released
The following are the features relased in geoserver for map updates

1. Added new table for historic data including whether the historic extent affects the user selected location
2. Added code to use 'APPROVAL_FOR_ACCESS' field for selection of modelled flood groups
3. Separated modelled scenarios from 'defended' and 'undefended' to 'defended', 'defences removed' and 'no defences exist'. This applies to both modelled maps and also modelled node tables
4. Updated flood defences selection code to use a CONTAINS spatial relationship rather than INTERSECTS to ensure whole defences are within the extent
5. Updated the GetContactDetails geoprocessing service to use the Environment Agency Public Face Areas dataset to handle locations placed just outside PSO area boundaries
6. Updated all print templates to make their scalebars have more meaningful numeric values
7. Updated modelled print template and code for climate change maps to make sure the symbols use symbol level rendering to make sure they are ordered correctly on the maps
8. Updated the code to create the historic maps to extract the 'Date of flood event' from the 'START_DATE' field rather than a separate 'FLOOD_EVENT_DATE' field

# No Changes
1) There are no changes in fmp-service apart from the bumping the version number
2) There are no changes in fmp-app apart from the bumping the version number