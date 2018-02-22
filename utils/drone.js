const debug = require('debug')('drone:client:drone');
const Drone = require('drone-node').Client;
const WebSocket = require('ws');
const print = require('./print');

const errorMessages = {
    404: 'There is not a single build yet!',
    500: 'Drone responded with 500 error... :('
};

const drone = env => {
    this.server = env.DRONE_SERVER;
    this.hostname = this.server.replace(/^https?:\/\//, '');
    this.client = new Drone({
        url: this.server,
        token: env.DRONE_TOKEN
    });

    return drone;
};

drone.subscribeBuildLogs = ({ owner, name, build, job }) => {
    const host = this.hostname;

    return new Promise((resolve, reject) => {
        const url = `wss://${host}/ws/logs/${owner}/${name}/${build}/${job}`;

        const ws = new WebSocket(url);

        ws.on('message', data => {
            print.message(JSON.parse(data));
        });

        ws.on('error', err => {
            if (err.message === 'Unexpected server response: 404') {
                resolve(err);
            } else {
                reject(err);
            }
        });

        ws.on('close', () => {
            resolve();
        });
    });
};

drone.getHostname = () => {
    return this.hostname;
};

drone.getBuildByFilter = ({ owner, name }, selectBuild) => {
    return this.client
        .getBuilds(owner, name)
        .then(builds => drone.getBuildByNumber({ owner, name }, selectBuild(builds)))
        .then(build => {
            debug(build);

            return build;
        });
};

drone.getBuildByNumber = ({ owner, name }, number) => {
    debug(owner, name, number);

    return this.client
        .getBuild(owner, name, number)
        .then(build => {
            debug(build);

            return build;
        })
        .catch(err => {
            if (errorMessages[err.statusCode]) {
                print.log(errorMessages[err.statusCode]);
                debug(err);
                process.exit(1);
            }

            return Promise.reject(err);
        });
};

drone.showBuildLogs = ({ owner, name, build, job }) => {
    return this.client
        .getBuildLogs(owner, name, build.number, job.number)
        .then(logs => {
            for (const record of logs) {
                print.message(record);
            }
        });
};

module.exports = drone;
