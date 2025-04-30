# EI Coop Assistant
A fan-made tool for the game *Egg, Inc.* by Auxbrain.

## 🔗 How to use
The website is currently hosted on Netlify: <https://ei-coop-assistant.netlify.app>

[![Netlify Status](https://api.netlify.com/api/v1/badges/3761eac5-1efd-4414-8715-98e632eb3e3a/deploy-status)](https://app.netlify.com/sites/ei-coop-assistant/deploys)

## ✨ Features
### Loading player inventory
This tool loads player’s data via their EID:
- Artifacts and stones
- Saved artifact sets
- Permit type (free/pro)
- Epic researches
- Colleggtibles
- Mystical Eggs
- Date and time of synchronization

### Hall of Artifacts
Visualize your current inventory and saved artifact sets.
Details on bonuses and stone slots are shown on mouse hover or keyboard focus.

### Earning (`/earning-set`)
#### Artifact solver
- **EB set** maximizes your EB in priority, and then your personal earnings
- **Earning set** maximizes your personal earnings
- **Mirror set** maximizes your personal earnings while mirroring
#### Settings
- **Cube swapping** includes the effect of the cube to the calculation if you don't want to hot-swap when buying
- **Reslotting** allows moving stones around in your inventory
- **Online** uses Max Running Chicken Bonus multiplier, while **Offline** uses away earnings
#### Estimation for maxing shipping researches
You must provide egg value, mirror EB and miscellaneous extra bonuses (from video doubler, events, teammate artifacts and contract modifiers).
> ℹ️ Research cost reductions can be included. For example a 70% sale is equivalent to a $\frac{100}{100-70} = 1/0.3$ earning bonus.

🟢 Green if you can complete without boosts, with an example of how long it takes at a certain population.\
🟡 Yellow if you can but need boosts. Take note of the boost multiplier you need! It may require what some consider unreasonable boosts.\
🔴 Red if you cannot complete even with the best boost combos.\
The border circle illustrates how much different bonuses weight (logarithmic scale).
#### Direct link for coop organizers
For easier usage, coop organizers can prefill input fields for their members with GET parameters:
- `egg_value`
- `mirror`
- `misc_bonus`

### Boosting (`/boosting-set`)
#### Artifact solver
- **Dilithium set** that's a dilithium set.
- **IHR set** maximizes your IHR while boosting
- **Slow-boost set** maximizes your contribution while using large tachyons
#### Settings
- **Including** a deflector and/or ship in a bottle in your IHR sets. IHR is prefered in your IHR set and team bonus is prefered in Slow-boost set
- **Reslotting** allows moving stones around in your inventory
- **Gusset swapping** finds best IHR sets at different gusset levels to benefit from higher IHR at lower population. You can allow the deflector or the ship in a bottle to be replaced if they are included in the first IHR set.
- **Gusset** forces a specific gusset in IHR and Slow-boost sets. Choose *any* to disable
- **Offline** mode enables Internal Hatchery Calm
- **Starting population** can be set to a desired value
#### Boost combos overview
Selection of common boost combos with an overview of how much they fill your habs with your artifacts (dili and IHR set).\
You can personalize the combos you want to show.\
The color code is:\
Grey for already filled (cf. starting population setting)\
Green for a tachyon boosted by a beacon\
Blue for a non-boosted tachyon\
Red for unfilled capacity\

You can tap the boost cards to expand the view. The top represents population while the bottom represents time.
### Timer
A button *start* starts a timer for the duration of the boosts, or until habs are filled.\
On compatible browsers, you will receive a notification when it's time to swap your gusset or renew your boosts, and once your habs are filled. On browsers that throttle background processes (mostly smartphones), notifications may not be reliable.

### Laying (`/laying-set`)
Determine optimal artifact sets and the tipping points between them, balancing egg laying and shipping rates based on deflector bonuses.\
Assumes all common research, vehicles, habs, silos are purchased and habs are filled.
If habs are not filled, consider using Slow-boost set instead.

#### Settings
- **Deflector mode** changes how deflectors are handled: maximizes personal rate (none), maximizes personal rate with a deflector equipped (contribution) or maximizes teamwork bonus (teamwork)
- **Reslotting** allows moving stones around in your inventory
- **Gusset** forces a specific gusset in your sets. Choose *any* to disable
- **Show variants** shows equivalent sets when there are (limited to 6)


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


