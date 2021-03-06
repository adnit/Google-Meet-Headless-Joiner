# Google-Meet-Headless-Joiner

#### Bot that pulls events from your Google Calender, joins and leaves them automatically.


### Usage guide

1. Clone the repo,
2. Rename `.env-example` to `.env` and replace it with email and password,
3. Login to your gmail account and go to this link `https://developers.google.com/calendar/quickstart/nodejs`,
4. `Enable the Google Calendar API` and follow the on-screen instructions,
5. Copy the downloaded file `credentials.json` and place it in root directory,
6. Install dependencies `npm install`,
7. Start the application `npm start`.

The first time you run the sample, it will prompt you to authorize access:

- Browse to the provided URL in your web browser,
- Follow the on-screen instructions,
- Copy the code you're given, paste it into the command-line prompt, and press `Enter`.

### Extras

- Added extra little feature, everytime you join meeting you have the option to send a message in the chat, to do so edit variable `message` in app.js line 14, to the message you want sent.
- If you want to see the bot in action(Logging in, joining etc.) edit this variable `headless = false` in app.js.


Part of this bot is based on this repository\(joining the meetings and leaving them\) https://github.com/AmanRaj1608/Google-Meet-Scheduler

## License

MIT

**Free Software, Hell Yeah!**
