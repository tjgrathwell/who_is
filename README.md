# Who is?

[![Build Status](https://travis-ci.org/tjgrathwell/who_is.png)](https://travis-ci.org/tjgrathwell/who_is)

A simple jQuery spaghetti quiz application to assist you with learning names.

http://tjgrathwell.github.io/who_is

## Running locally

`broccoli serve`

## Deployment

`broccoli build dist`

... then copy the generated `dist` directory off to your favorite static site hosting service.

## Testing

### Automatic

`npm test`

### Manual

Start the server with `npm run-script test-server`

Visit `http://localhost:9876/` in your browser.

### Focused

You can run a focused test or group of tests by passing the name on the command line:

`npm run test-server` to start the server
`npm run test-run -- "who_is shows the app title"`
