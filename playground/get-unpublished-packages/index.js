const { getPackages } = require('@manypkg/get-packages');
const exec = require('@yiminghe/shell-exec');

function getCorrectRegistry(packageJson) {
  const registry =
    packageJson?.publishConfig?.registry ?? process.env.npm_config_registry;

  return !registry || registry === 'https://registry.yarnpkg.com'
    ? 'https://registry.npmjs.org'
    : registry;
}

async function getPackageInfo(packageJson) {
  console.info(`npm info ${packageJson.name}`);

  // Due to a couple of issues with yarnpkg, we also want to override the npm registry when doing
  // npm info.
  // Issues: We sometimes get back cached responses, i.e old data about packages which causes
  // `publish` to behave incorrectly. It can also cause issues when publishing private packages
  // as they will always give a 404, which will tell `publish` to always try to publish.
  // See: https://github.com/yarnpkg/yarn/issues/2935#issuecomment-355292633
  let result = exec(
    [
      'npm',
      'info',
      packageJson.name,
      '--registry',
      getCorrectRegistry(packageJson),
      '--json',
    ].join(' '),
  );

  // Github package registry returns empty string when calling npm info
  // for a non-existent package instead of a E404
  if (result.stdout.toString() === '') {
    return {
      error: {
        code: 'E404',
      },
    };
  }
  return JSON.parse(result.stdout.toString());
}

async function infoAllow404(packageJson) {
  let pkgInfo = await getPackageInfo(packageJson);
  if (pkgInfo.error?.code === 'E404') {
    console.warn(`Received 404 for npm info ${`"${packageJson.name}"`}`);
    return { published: false, pkgInfo: {} };
  }
  if (pkgInfo.error) {
    console.error(
      `Received an unknown error code: ${
        pkgInfo.error.code
      } for npm info ${`"${packageJson.name}"`}`,
    );
    console.error(pkgInfo.error.summary);
    if (pkgInfo.error.detail) console.error(pkgInfo.error.detail);

    throw new ExitError(1);
  }
  return { published: true, pkgInfo };
}

async function getUnpublishedPackages(packages) {
  const results = await Promise.all(
    packages.map(async ({ packageJson }) => {
      const response = await infoAllow404(packageJson);
      let publishedState = 'never';
      if (response.published) {
        publishedState = 'published';
      }

      return {
        name: packageJson.name,
        localVersion: packageJson.version,
        publishedState,
        publishedVersions: response.pkgInfo.versions || [],
      };
    }),
  );

  const packagesToPublish = [];

  for (const pkgInfo of results) {
    const { name, publishedState, localVersion, publishedVersions } = pkgInfo;
    if (!publishedVersions.includes(localVersion)) {
      packagesToPublish.push(pkgInfo);
      console.info(
        `${name} is being published because our local version (${localVersion}) has not been published on npm`,
      );
    } else {
      // If the local version is behind npm, something is wrong, we console.warn here, and by not getting published later, it will fail
      console.warn(
        `${name} is not being published because version ${localVersion} is already published on npm`,
      );
    }
  }

  return packagesToPublish;
}

module.exports = async () => {
  const { packages, tool } = await getPackages(process.cwd());

  const publicPackages = packages.filter((pkg) => !pkg.packageJson.private);

  const unpublishedPackagesInfo = await getUnpublishedPackages(publicPackages);

  return unpublishedPackagesInfo;
};

if (require.main === module) {
  (async function () {
    console.log(getCorrectRegistry());
    const unpublishedPackagesInfo = await module.exports();
    console.log(unpublishedPackagesInfo);
  })();
}
