const moment = require('moment');
const colors = require('colors/safe');

const statusColors = {
    skipped: 'green',
    pending: 'yellow',
    running: 'yellow',
    success: 'green',
    failure: 'red',
    killed: 'red',
    error: 'red'
};

const log = function() {
    console.log.apply(console, arguments); // eslint-disable-line
};

exports.log = log;

exports.repo = ({ owner, name }) => {
    log(`Repository: ${owner}/${name}`);
    log('--------------------------');
};

exports.build = ({ owner, name, server, build }) => {
    log(`Message:  ${colors.italic.bold(build.message.replace(/\n/, ' '))}`);
    log('--------------------------');
    log(`Event:    ${build.event}`);
    log(`Build:    ${build.number} https://${server}/${owner}/${name}/${build.number}`);
    log(`Author:   ${build.author} <${build.author_email}>`);
    log(`Commit:   ${build.link_url}`);
    log('--------------------------');
};

exports.job = ({ job }) => {
    const start = moment(new Date(job.started_at * 1000));
    const finish = moment(new Date(job.finished_at * 1000));
    const format = 'DD.MM.YYYY HH:mm:ss';

    log('--------------------------');
    log(`Status:   ${colors[statusColors[job.status]].bold(job.status)}`);
    log(`Started:  ${start.format(format)} (${start.fromNow()})`);
    log(`Finished: ${finish.format(format)} (${finish.fromNow()})`);
};

exports.link = ({ owner, name, server, build }) => {
    if (owner && name) {
        const url = `https://${server}/${owner}/${name}`;

        log('--------------------------');
        log(`${url}/${build.number}`);
    }
};

exports.message = data => {
    if (data.out) {
        let pipe = `${data.proc}:`;
        let text = data.out;

        if (pipe.length <= 10) {
            pipe += (new Array(10 - pipe.length)).join(' ');
        }

        if (text[0] === '+') {
            text = colors.bold.green(text);
        }

        log(`${pipe} ${text}`);
    }
};
