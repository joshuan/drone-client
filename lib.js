const gitUtils = require('./utils/git');
const droneUtils = require('./utils/drone');
const buildUtils = require('./utils/build');
const print = require('./utils/print');

module.exports = (env, input, flags) => {
    const drone = droneUtils(env);

    return gitUtils
        .getRepository(flags.remote)
        .then(repo => {
            print.repo(repo);

            let promise = null;

            if (input[0]) {
                promise = drone
                    .getBuildByNumber(repo, input[0]);
            } else if (flags.user) {
                promise = drone
                    .getBuildByFilter(repo, buildUtils.getBuildNumberByAuthor(flags.user));
            } else if (flags.event) {
                promise = drone
                    .getBuildByFilter(repo, buildUtils.getBuildNumberByEvent(flags.event));
            } else {
                promise = drone
                    .getBuildByFilter(repo, buildUtils.getLastBuildNumber);
            }

            return promise
                .then(build => ({
                    owner: repo.owner,
                    name: repo.name,
                    build,
                    job: build.jobs[0],
                    server: drone.getHostname()
                }));
        })
        .then(data => {
            print.build(data);

            if (['success', 'failure'].includes(data.job.status)) {
                return drone.showBuildLogs(data)
                    .then(() => {
                        return data;
                    });
            }

            return drone.subscribeBuildLogs(data)
                .then(() => drone.getBuildByNumber(data, data.build.number))
                .then(build => {
                    data.build = build;

                    return data;
                });
        })
        .then(data => {
            print.link(data);

            return data;
        });
};
