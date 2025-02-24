# EI Coop Assistant
A fan-made tool for the game *Egg, Inc.* by Auxbrain.

## 🔗 How to use
The website is currently hosted on Netlify: <https://ei-coop-assistant.netlify.app>

[![Netlify Status](https://api.netlify.com/api/v1/badges/3761eac5-1efd-4414-8715-98e632eb3e3a/deploy-status)](https://app.netlify.com/sites/ei-coop-assistant/deploys)

## ✨ Features
### Hall of Artifacts
Visualize your current inventory and saved artifact sets.
Details on bonuses and stone slots are shown on mouse hover or keyboard focus.

### Laying sets
This tool analyzes a player’s inventory (via their EID) to determine optimal artifact sets and the tipping points between them, balancing egg laying and shipping rates based on deflector bonuses.

It offers three deflector modes: No Forced Deflector (maximizes personal rate without locking a deflector), Forced Deflector for Personal Contribution (includes the deflector that maximizes personal rate), and Forced Deflector for Teamwork (locks in the highest deflector).

An option to allow stone reslotting is also present.

The tool assumes all common research, vehicles, habs, and silos are purchased, habs are filled.
Epic research, Hyperloop, and Colleggtibles are read from the user’s EID to calculate base rates (with no artifacts equipped, not even a Gusset).
These rates can be customized in the settings if needed.

## 📦 Build Dependencies
- Node.js
- npm
- netlify-cli

## 🛠️ Installation
Clone the repository and install dependencies:
```sh
git clone https://github.com/Kaylier/ei-coop-assistant.git
cd ei-coop-assistant
npm install
```

## 💻 Try it locally
To load a used inventory from an EID, the website requires a proxy running.
To build and run the website locally along with the proxy, run:
```sh
npx netlify serve
```
> **Note:** This command serves your production build (from the dist folder) and runs Netlify Edge Function implementing the CORS proxy.

## 🔧 Development
To run the server in development mode without proxy:
```sh
npm run dev
```

To run the server in development mode with the proxy:
```sh
npx netlify dev
```

To build and run in production mode, without proxy:
```sh
npm run build
npm run preview
```

To build and run in production mode with the proxy:
```sh
npx netlify serve
```


## Credits
- Font: *Always Together* by Paulo R.
- Item images: From or derived from Auxbrain's assets.


