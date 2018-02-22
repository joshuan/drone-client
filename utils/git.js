const git = require('simple-git')(process.pwd);
const debug = require('debug')('drone:client:git');

git._silentLogging = true;

function _parseGitRepository(remoteName, repos) {
    const remotes = repos.find(remote => remote.name === remoteName);

    if (!remotes) {
        throw new Error(`Undefined git remote ${remoteName}`);
    }

    const { refs: { push: url } } = remotes;

    const splited = url.split(':')[1].split('.')[0].split('/');
    const result = { owner: splited[0], name: splited[1] };

    debug(url);
    debug(result);

    return result;
}

function getGitRepository(remoteName) {
    return new Promise((resolve, reject) => {
        git.getRemotes(true, (err, repos) => {
            if (err) {
                reject(err);
            } else {
                resolve(_parseGitRepository(remoteName, repos));
            }
        });
    });
}

exports.getRepository = getGitRepository;
