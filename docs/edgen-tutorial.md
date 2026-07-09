# EDGEN
EDGEN is a userscript for automatic skip and next-activity via Edgenuity.
Do not use this without EXPLICIT permission from a proctor or instructor. By using this script, you take all responsibility and accept all risks that come with using userscripts & automation.

## Installing
Installing EDGEN is pretty simple. First get the [Tampermonkey](https://www.tampermonkey.net/) extension for your browser - it is best to do this on a non-schoool device that still can access Edgenuity.

Then, navigate to the page for EDGEN's script: [raw:GavinGoGaming/Devmarklet/edgen/edgenbot.user.js](https://github.com/GavinGoGaming/Devmarklet/raw/refs/heads/main/edgen/edgenbot.user.js). Opening this link should automatically open tampermonkey's install page, but if not, you can head to [this install link](https://www.tampermonkey.net/script_installation.php#url=https://raw.githubusercontent.com/gavingogaming/devmarklet/raw/refs/heads/main/edgen/edgen.user.js).

Before clicking "Install", follow the in-script instructions or the instructions below to get a Gemini API key for auto-solves. If you do not want any auto-practice, do not do this step.

<img width="685" height="682" alt="image" src="https://github.com/user-attachments/assets/2b78bbe5-4032-4901-84a6-c8b5c1d822d2" />

## Auto-Practice Key
Getting a google AI Studio api key is needed for auto-practice/auto-solve. This feature ***does not, and will never apply to quizzes, tests, exams, or any sort of assesment.***

1. Go to [Google AI Studio](https://aistudio.google.com/) and sign in.
2. On the sidebar, click Dashboard and then API Keys, or click [here](https://aistudio.google.com/api-keys).
3. Click "Create API Key"
4. Give it any name, and under "Choose Imported Project" select "Create Project". This can also have any name.
5. Once the key is created, copy the API Key field and put it in the userscript

(ex. `const GEMINI_API_KEY = "AQ.abcdefghijklmnopqrstvuwxyz";`)

<img width="740" height="107" alt="image" src="https://github.com/user-attachments/assets/4fb3b55f-da9e-4dfb-9b71-208a3f35f629" />

You can also add a Mistral key as a backup. I highly reccomend this as google has strict limits.

1. Go to [Mistral Studio Console](https://console.mistral.ai/)
2. Go to API Keys
3. Add a new key, any name, no expiration
4. Copy the key and enter it under the MIXTRAL_KEY line
