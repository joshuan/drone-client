#!/usr/bin/env node

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const start = require('./lib');
const meow = require('meow');

const cli = meow(`
    By default: show last build log from all users in current repository. 

    Usage
      $ drone-client <buildNumber>
      
    Options
      --remote, -r   Git remote (default - origin)
      --user, -u     Build author
      --event, -e    Drone event (pull_request, push, tag)
`, {
    flags: {
        remote: {
            type: 'string',
            alias: 'r',
            default: 'origin'
        },
        user: {
            type: 'string',
            alias: 'u',
            default: null
        },
        event: {
            type: 'string',
            alias: 'e',
            default: null
        }
    }
});

start(process.env, cli.input, cli.flags)
    .then(() => {
        process.exit(0);
    })
    .catch(err => {
        console.error('Catched error:', err);
        process.exit(1);
    });
