require('dotenv').config();
const GoogleMeet = require('./google-meet');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { setInterval } = require('timers');

let email = process.env.EMAIL;
let password = process.env.PASSWORD;
let strict = true;
let headless = true;

// edit this to add a welcoming message everytime you join a meeting
let message = '' // for ex. Hello everyone

obj = new GoogleMeet(email, password, headless, strict, message);

let url = {};
let ind = 0;

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'token.json';

function checkEvents() {
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), listEvents);
  });
}

checkEvents();

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}
function listEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  calendar.events.list(
    {
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 30,
      singleEvents: true,
      orderBy: 'startTime',
    },
    (err, res) => {
      if (err) return console.log('The API returned an error: ' + err);
      const events = res.data.items;
      if (events.length) {
        console.log(`Upcoming events`);
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          const end = event.end.dateTime || event.start.date;
          let startUTC = new Date(start).toDateString();
          console.log(`${startUTC} | ${event.summary.padEnd(35)} | ${event.hangoutLink}`);
          ind++;
          url[ind] = {};
          url[ind].url = `${event.hangoutLink}`;
          url[ind].startTime = Date.parse(`${start}`);
          url[ind].endTime = Date.parse(`${end}`);
          url[ind].summary = `${event.summary}`
          firstTimeRun = true;
        });
      } else {
        console.log('No upcoming events found.');
      }
    }
  );
  listen();
}
let firstTimeRun = false;
let pos = 1;
function showNextEvent(){
  nextEvent = new Date(url[pos].startTime)
  nextEventHour = nextEvent.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  nextEventDate = nextEvent.toDateString()
  console.log(`\nThe next event is:\n${nextEventDate} - ${nextEventHour}\n${url[pos].summary} | ${url[pos].url}`); 
}

function showAllEvents(){
  let startTime;
  for(i in url){
    startTime = new Date(url[i].startTime).toDateString();
    console.log(`${startTime} | ${url[i].summary} | ${url[i].url}`)
  }
}
function listen() {
  setInterval(() => {
    while(firstTimeRun){
      showNextEvent();
      firstTimeRun = false;
    }
    if (Object.keys(url).length < 5) {
      checkEvents();
      firstTimeRun = true;
    }
    for (x in url) {
      if (url[x].startTime < Date.now()) {
        console.clear()
        var start = new Date(url[x].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        var end = new Date(url[x].endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        console.log(`\nJoining: ${url[x].summary} | ${start} - ${end} | ${url[x].url}`);
        obj.schedule(url[x].url);
        url[x].startTime = url[x].endTime + 2000;
      }
      if (url[x].endTime < Date.now()) {
        console.log(`\nLeaving: ${url[x].summary}`);
        obj.end();
        console.log(`Left: ${url[x].summary} successfully\n`);
        delete url[x];
        pos++;
        showAllEvents();
        showNextEvent();
      }
    }
  }, 1000);
  console.log(`App running`);
}
