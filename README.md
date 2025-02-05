# EI Coop Assistant
A fan-made tool for the game *Egg, Inc.* by Auxbrain.

## How to use
The website is currently hosted on Netlify: <https://ei-coop-assistant.netlify.app>

[![Netlify Status](https://api.netlify.com/api/v1/badges/3761eac5-1efd-4414-8715-98e632eb3e3a/deploy-status)](https://app.netlify.com/sites/ei-coop-assistant/deploys)

### Local hosting
If you want to host it locally, you'll need python 3 and the [requests library](<https://requests.readthedocs.io>).
1. change the API endpoint in the file `scripts/api.ts`.
2. run `python run.py` from the root of the repository.
3. open your browser and navigate to the url `localhost:8000`.

## Tools
### Hall of Artifacts
Visualize your current inventory and saved artifact sets.
Details on bonuses and stone slots are shown on mouse hover or keyboard focus.

### Laying sets
This tool analyzes a player’s inventory (via their EID) to determine optimal artifact sets and the tipping points between them, balancing egg laying and shipping rates based on deflector bonuses.

It offers three modes: No Forced Deflector (maximizes personal rate without locking a deflector), Forced Deflector for Personal Contribution (includes the deflector that maximizes personal rate), and Forced Deflector for Teamwork (locks in the highest deflector).

The tool assumes all common research, vehicles, habs, and silos are purchased, habs are filled, and artifacts won’t be reslotted.
Epic research, Hyperloop, and Colleggtibles are read from the user’s EID to calculate base rates (with no artifacts equipped, not even a Gusset).
These rates can be customized in the settings if needed.

## Dependencies
This website is purely static and requires no build process.

The javascript libraries loaded at runtime are:
- [vue](<https://vuejs.org/>)
- [vue-router](<https://router.vuejs.org/>)
- [vue3-sfc-loader](<https://github.com/FranckFreiburger/vue3-sfc-loader>)
- [protobufjs](<https://github.com/protobufjs/protobuf.js>).

## Credits
- Font: *Always Together* by Paulo R.
- Item images: From or derived from Auxbrain's assets.


