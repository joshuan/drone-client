const debug = require('debug')('drone:client:build');
const print = require('./print');

exports.getBuildNumberByAuthor = author => {
    return builds => {
        const lastAuthorBuild = builds.find(build => build.author === author);

        if (!lastAuthorBuild) {
            print.log(`There is not a single build yet by ${author}!`);

            debug(builds);

            process.exit(1);
        }

        return lastAuthorBuild.number;
    };
};

exports.getBuildNumberByEvent = event => {
    return builds => {
        const lastEventBuild = builds.find(build => build.event === event);

        if (!lastEventBuild) {
            print.log(`There is not a single build yet by ${event}!`);

            debug(builds);

            process.exit(1);
        }

        return lastEventBuild.number;
    };
};

exports.getLastBuildNumber = builds => {
    return builds[0].number;
};
