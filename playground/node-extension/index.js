const { isBuiltin } = require('node:module');
const { dirname } = require('node:path');
const { cwd } = require('node:process');
const { fileURLToPath, pathToFileURL } = require('node:url');
const { promisify } = require('node:util');

const resolveCallback = require('resolve/async');

const resolveAsync = promisify(resolveCallback);

const baseURL = pathToFileURL(cwd() + '/').href;

module.exports.resolve = async function resolve(specifier, context, next) {
  const { parentURL = baseURL } = context;

  if (isBuiltin(specifier)) {
    return next(specifier, context);
  }

  // `resolveAsync` works with paths, not URLs
  if (specifier.startsWith('file://')) {
    specifier = fileURLToPath(specifier);
  }
  const parentPath = fileURLToPath(parentURL);

  let url;
  try {
    const resolution = await resolveAsync(specifier, {
      basedir: dirname(parentPath),
      // For whatever reason, --experimental-specifier-resolution=node doesn't search for .mjs extensions
      // but it does search for index.mjs files within directories
      extensions: ['.js', '.json', '.node', '.mjs', '.ts'],
    });
    url = pathToFileURL(resolution).href;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      // Match Node's error code
      error.code = 'ERR_MODULE_NOT_FOUND';
    }
    throw error;
  }

  return next(url, context);
};
