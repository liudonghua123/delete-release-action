import core from '@actions/core';
import github from '@actions/github';

function processFailOrWarning(message: string, suppress_errors: boolean) {
  if (suppress_errors) {
    core.warning(message);
  } else {
    core.setFailed(message);
  }
}

async function run() {
  const release_name = core.getInput('release_name');
  const release_id = Number(core.getInput('release_id'));
  const suppress_errors = Boolean(core.getInput('suppress_errors'));
  core.info(
    `Input of action, release_name: ${release_name}, release_id: ${release_id}, suppress_errors: ${suppress_errors}`,
  );
  if (!release_name && !release_id) {
    processFailOrWarning(
      `release_name or release_id should provided! You input release_name: ${release_name}, release_id: ${release_id}`,
      suppress_errors,
    );
    return;
  }
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  core.info(`The event payload: ${payload}`);

  // Get authenticated GitHub client (Ocktokit): https://github.com/actions/toolkit/tree/master/packages/github#usage
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN!);
  const { owner, repo } = github.context.repo;

  try {
    // make a rule: release_id has high priority then release_name
    // list all release and find the release according to the id or name
    const { data: releases } = await octokit.repos.listReleases({
      owner,
      repo,
    });
    let filtered_releases;
    if (release_id) {
      filtered_releases = releases.filter(
        (release: { id: any; }) => release.id === release_id,
      );
      if (filtered_releases.length === 0) {
        processFailOrWarning(
          `Could not find any release with the id of ${release_id}`,
          suppress_errors,
        );
        return;
      }
    } else {
      filtered_releases = releases.filter(
        (release: { name: any; }) => release.name === release_name,
      );
      if (filtered_releases.length === 0) {
        processFailOrWarning(
          `Could not find any release with the name of ${release_name}`,
          suppress_errors,
        );
        return;
      }
      if (filtered_releases.length > 1) {
        processFailOrWarning(
          `Find more than one release with the name of ${release_name}`,
          suppress_errors,
        );
        return;
      }
    }
    const { assets } = filtered_releases[0];
    core.info(`Prepare to delete assets: ${assets}`);
    const deleted_assets: any[] = [];
    assets.forEach(async ({ id: asset_id, name: asset_name }) => {
      try {
        await octokit.repos.deleteReleaseAsset({ owner, repo, asset_id });
        deleted_assets.push(asset_name);
      } catch (error) {
        core.warning(`Caught ${error}`);
      }
    });
    core.setOutput('deleted_assets', deleted_assets);
    // delete the release
    await octokit.repos.deleteRelease({ owner, repo, release_id });
  } catch (error) {
    processFailOrWarning(error.message, suppress_errors);
  }
}

run();
