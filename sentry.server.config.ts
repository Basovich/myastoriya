// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://29d44153a8a5b6b17af0002dcd11e491@o4511245579386880.ingest.de.sentry.io/4511245688963152",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1.0,

  // Ignore 'aborted' errors which are common in Node.js when client disconnects
  ignoreErrors: [
    /aborted/i,
  ],

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  environment: process.env.NODE_ENV,
});
