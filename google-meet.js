// Source: https://github.com/AmanRaj1608/Google-Meet-Scheduler
// const puppeteer = require('puppeteer');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// const WELCOMING_MESSAGE = 'Pershendetje'

puppeteer.use(StealthPlugin());

class GoogleMeet {
  constructor(email, pass, headless, strict, message) {
    this.email = email;
    this.pass = pass;
    this.headless = headless;
    this.strict = strict;
    this.browser;
    this.page;
    this.message = message;
  }
  async schedule(url) {
    try {
      // Open browser
      this.browser = await puppeteer.launch({
        headless: this.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--use-fake-ui-for-media-stream',
          '--disable-audio-output',
        ],
      });
      this.page = await this.browser.newPage();
      await this.page.goto(
        'https://accounts.google.com/signin/v2/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin'
      );

      // Login Start
      await this.page.type('input#identifierId', this.email, {
        delay: 0,
      });
      await this.page.click('div#identifierNext');

      await this.page.waitForTimeout(7000);

      await this.page.type('input[name=password]', this.pass, {
        delay: 0,
      });
      await this.page.click('div#passwordNext');

      await this.page.waitForTimeout(5000);

      await this.page.goto(url);

      console.log('  Disabling audio and video');
      await this.page.waitForTimeout(7000);
      try {
        await this.page.click('div.IYwVEf.HotEze.uB7U9e.nAZzG');
      } catch (e) {
       // console.log('    Audio disabled already');
        
      }
      await this.page.waitForTimeout(1000);
      try {
        await this.page.click('div.IYwVEf.HotEze.nAZzG');
      } catch (e) {
        console.log('    Video disabled already');
      }

      // sanity check (connect only if both audio and video are muted) :P
      if (this.strict) {
        let audio = await this.page.evaluate(
          'document.querySelectorAll("div.sUZ4id")[0].children[0].getAttribute("data-is-muted")'
        );
        let video = await this.page.evaluate(
          'document.querySelectorAll("div.sUZ4id")[1].children[0].getAttribute("data-is-muted")'
        );

        if (audio === 'false' || video === 'false') {
          console.log(
            "Not joining meeting. We couldn't disable either audio or video from the device.\nYou may try again."
          );
          return;
        }
        console.log('  Audio and video disabled');
      }

      await this.page.waitForTimeout(1000);
      await this.page.click('span.NPEfkd.RveJvd.snByac');

      console.log('Successfully joined/Sent join request');

      await this.page.waitForTimeout(5000);
      await this.page.click('div.HKarue');
      await this.page.waitForTimeout(1000);
      await this.page.click('div.Pc9Gce.Wic03c');
      if(this.message.length > 1){
        await this.page.keyboard.type(this.message,{delay:214})
        await this.page.keyboard.press('Enter')
        console.log('Welcoming message sent in chat') }
    } catch (err) {
      console.log(err);
    }
  }

  async end() {
    await this.browser.close();
  }
}

module.exports = GoogleMeet;
