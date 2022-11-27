const cp = require('child_process');
const fs = require('fs');
let lastVersion;
try {
    lastVersion = cp.execSync('git describe --abbrev=0 --tags').toString().trim().split('-')[0];
} catch (e) {
    lastVersion = '0.0.0';
}
lastVersion = lastVersion.split('.').map((v) => parseInt(v, 10));
let changeLog = fs.readFileSync('CHANGELOG.md', 'utf8');
let latestChangeLog = changeLog.split('\n---\n')[0].split('\n');
let latestVersions = latestChangeLog.filter(x=>x?/\d+\.\d+\.\d+/.test(x):x);
if(latestVersions.length === 0) {
    throw new Error('No new version found in CHANGELOG.md, please update it first');
}
if(latestVersions.length > 1) {
    console.warn('More than one version found in CHANGELOG.md');
}
let latestVersion = latestVersions[0].split('.').map((v) => parseInt(v, 10));
fs.writeFileSync('commit-msg.txt', latestChangeLog.join('\n'));
fs.writeFileSync('package.json', fs.readFileSync('package.json', 'utf8').replace(/"version": "\d+\.\d+\.\d+"/, `"version": "${latestVersion.join('.')}"`));
cp.execSync('git add .');
cp.execSync(`git commit -F commit-msg.txt && git tag -a v${latestVersion.join('.')} -F commit-msg.txt `)
cp.execSync(`git push && git push --tags`);