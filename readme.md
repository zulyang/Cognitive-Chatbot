## HomeTeam Emergency Bot (H.E.B)

This repo contains a chatbot that i built using NodeJS, the Microsoft Bot Framework, Microsoft Cognitive Services and LUIS, as part of the Microsoft Inter-Uni Hackathon 2018.

### Rationale
Deaf and mute people do not have the ability to call for help in times of emergency.
Furthermore, this bot can also be used for users who are in a situation where they cannot speak. Examples include  a hostage situation when informant is hiding or when the informant are unable to speak for fear of revealing their position.

It uses a waterfall process that prompts the user a series of questions, to obtain information to be passed on to the responder (Police or Fire).
The bot obtains the location of the user via Bing Maps API.
The bot also uses Microsoft Cognitive Services Computer Vision API to analyze an image and return to the operator the image caption, so that he can draw more information form the incident.

You may access the bot via @hebxbot on Telegram.

### Build and debug
1. download source code zip and extract source in local folder
2. download and run [botframework-emulator](https://emulator.botframework.com/)
3. connect the emulator to http://localhost:3987
4. Run -node app.js in terminal.


### Publish back

```
npm run azure-publish
```
