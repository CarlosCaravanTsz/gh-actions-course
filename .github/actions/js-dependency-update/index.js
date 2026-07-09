const core = require("@actions/core");
const exec = require("@actions/exec");


const validateBranch = ({ branchName }) =>
  /^[a-zA-Z0-9_\-\.\/]+$/.test(branchName);
const validateDirName = ({ dirName }) => /^[a-zA-Z0-9_\-\.\/]+$/.test(dirName);

async function run() {
  /*
  OK 1. Parse inputs:
    1.1 base-branch from which to check for updates
    1.2 target-branch to use to create the PR
    1.3 Github Token for auth to create PRs
    1.4 Working directory for which to check for dependencies
  OK 2. Execute the npm update command command within the working directory
  OK 3. Check whether there are modified package*.json files
  4. If there are modified files:
    4.1 Add and commit files to the target-branch
    4.2. Create a PR to the base-branch using the octokit API
  5. Otherwise, conclude the custom action
*/
  const baseBranch = core.getInput("base-branch");
  const targetBranch = core.getInput("target-branch");
  const ghToken = core.getInput("gh-token");
  const workingDir = core.getInput("working-directory");
  const debug = core.getBooleanInput("debug");

  core.setSecret(ghToken);

  if (!validateBranch({ branchName: baseBranch })) {
    core.setFailed("Invalid base-branch name.");
    return;
  }

  if (!validateBranch({ branchName: targetBranch })) {
    core.setFailed("Invalid base-branch name.");
    return;
  }

  if (!validateDirName({ dirName: workingDir })) {
    core.setFailed("Invalid base-branch name.");
    return;
  }

  core.info(`[js-dependency-update] : base-branch is ${baseBranch}`); 
  core.info(`[js-dependency-update] : target-branch is ${targetBranch}`);
  core.info(`[js-dependency-update] : working dir is ${workingDir}`);

  await exec.exec('npm update', [], {
    cwd: workingDir
  })

  const gitStatus = await exec.getExecOutput(' git status -s package.json', [], {
    cwd: workingDir
  })

  if (gitStatus.stdout.length > 0) {
    core.info('There are updates available!')
  } else {
    core.info("No updates at this point in time")
  }




}

run();
