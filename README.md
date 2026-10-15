# Steel Coaching: Hyrox site

A Hyrox-focused redesign of [steelcoaching.co.uk](https://steelcoaching.co.uk), hosted on GitHub Pages. It's a static site with no build step: `index.html`, `assets/css/style.css` and `assets/js/app.js`.

Run it locally with `python3 -m http.server`, then open http://localhost:8000.

## Interactive features
- **Race explorer**: all 16 race segments, with weights for each division and a coach's tip for each station.
- **Finish-time predictor**: uses 5k time and station confidence to predict a finish time, a 12-week target and the biggest time sinks. Results can be shared by URL (`?d=MO&r=1500&s=2&e=2`).
- **Race countdown**: shows days and weeks to race day and the current training phase. It's saved in the visitor's browser.
- **Lead form**: a 4-step quiz that hands off to WhatsApp or email with a prefilled message.
- **Sticky mobile CTA dock** and a "you've been on the clock" hero timer.

## To do before going live
- **Capture leads in the CRM**: set `CONFIG.formEndpoint` in `assets/js/app.js` to a GoHighLevel inbound webhook (or Formspree). The form will then POST JSON (`name, contact, goal, level, race, programme, predicted`) as well as offering the WhatsApp handoff.
- **Check the content**: the Hyrox Squad and Race Prep 1-2-1 programmes, "monthly race simulations" and the "15-minute call" are proposed copy. Confirm they match what the gym offers.
- **Confirm WhatsApp**: check that 07463 865 772 is on WhatsApp.
- **Custom domain**: add a `CNAME` file containing `steelcoaching.co.uk` and point DNS at GitHub Pages.
