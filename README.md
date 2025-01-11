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

### Laying sets
Find artifact sets that maximize your contribution for a received deflector bonus, assuming all habitats are filled.
- Artifacts are read from the player inventory, and no reslotting is performed.
- Bonuses given to other coop members are not considered. However, you can force the presence of a deflector.

If you haven't completed your Epic Researches, Common Researches or lack relevant collegtibles, you can customize the base laying and shipping rates.
These are the maximum rates achievable without any artifacts (not even a Gusset).

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


