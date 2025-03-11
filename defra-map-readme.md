TO Build defra-map as a submodule, do the following:
 -- Then add the following line to .env file
    build_map_as_submodule=true
-- Then run these commands
 git submodule init
 git submodule update
 -- Install the submodule packages
 cd defra-map
 npm ci
 cd ..
-- Finally build the fmp-app 
 npm run build