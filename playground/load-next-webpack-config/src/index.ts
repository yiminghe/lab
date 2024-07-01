import loadConfig from 'next/dist/server/config';
import getNextJsBaseWebpackConfig from 'next/dist/build/webpack-config';
import nextLoadJsConfig from 'next/dist/build/load-jsconfig';
import { trace } from 'next/dist/trace/trace';

const tag = 'loadNextWebpackConfig';

process.env.NEXT_PRIVATE_LOCAL_WEBPACK = '1';

export interface LoadParams {
  cwd: string;
  dev: boolean;
}

export default async function loadNextWebpackConfig({ dev, cwd }: LoadParams) {
  const nextConfig = await loadConfig(dev ? 'development' : 'production', cwd);
  const jsConfigResult = await nextLoadJsConfig(cwd, nextConfig);

  const webpackConfig = await getNextJsBaseWebpackConfig(cwd, {
    buildId: `${tag}-${Math.random().toString()}`,
    config: nextConfig,
    dev,
    entrypoints: {},
    rewrites: { fallback: [], afterFiles: [], beforeFiles: [] },
    runWebpackSpan: trace(tag),
    appDir: cwd,
    compilerType: 'client',
    encryptionKey: tag,
    originalRedirects: [],
    originalRewrites: undefined,
    // Required for Next.js > 13.2.0 to respect TS/JS config
    jsConfig: jsConfigResult.jsConfig,
    // Required for Next.js > 13.2.0 to respect tsconfig.compilerOptions.baseUrl
    resolvedBaseUrl: jsConfigResult.resolvedBaseUrl,
    // Added in Next.js 13, passed via `...info`: https://github.com/vercel/next.js/pull/45637/files
    supportedBrowsers:undefined,
  });

  return webpackConfig;
}
