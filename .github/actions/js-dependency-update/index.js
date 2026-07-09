const core = require("@actions/core");
const exec = require("@actions/exec");
const github = require("@actions/github")

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
  const baseBranch = core.getInput("base-branch", { required: true });
  const headBranch = core.getInput("head-branch", {required: true});
  const ghToken = core.getInput("gh-token", { required: true });
  const workingDir = core.getInput("working-directory", { required: true });
  const debug = core.getBooleanInput("debug");

  core.setSecret(ghToken);

  if (!validateBranch({ branchName: baseBranch })) {
    core.setFailed("Invalid base-branch name.");
    return;
  }

  if (!validateBranch({ branchName: headBranch })) {
    core.setFailed("Invalid base-branch name.");
    return;
  }

  if (!validateDirName({ dirName: workingDir })) {
    core.setFailed("Invalid base-branch name.");
    return;
  }

  core.info(`[js-dependency-update] : base-branch is ${baseBranch}`);
  core.info(`[js-dependency-update] : target-branch is ${headBranch}`);
  core.info(`[js-dependency-update] : working dir is ${workingDir}`);

  await exec.exec('npm update --legacy-peer-deps', [], {
    cwd: workingDir
  })

  const gitStatus = await exec.getExecOutput(' git status -s package.json', [], {
    cwd: workingDir
  })

  if (gitStatus.stdout.length > 0) {
    core.info('There are updates available!')
    await exec.exec('git config --global user.name "gh-automation"')
    await exec.exec('git config --global user.email "testing@automation.ui"')
    await exec.exec(`git checkout -b ${headBranch} `, [], {
      cwd: workingDir
    })
    await exec.exec(`git add package.json package-lock.json`, [], {
      cwd: workingDir,
    });
    await exec.exec(`git commit -m "chore: update dependencies`, [], {
      cwd: workingDir,
    });
    await exec.exec(`git push -u origin ${headBranch} --force`, [], {
      cwd: workingDir,
    });

    const octokit = github.getOctokit(ghToken);

    try {
      await octokit.rest.pulls.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        title: 'Update NPM dependencies',
        body: 'This pull request updates NPM packages',
        base: baseBranch,
        head: headBranch
      });
    } catch (e) {
      core.error('Something went wrong while creating the PR. Check the logs below')
      core.setFailed(e.message);
      core.error(e);
    }
    


  } else {
    core.info("No updates at this point in time")
  }




}

run();
