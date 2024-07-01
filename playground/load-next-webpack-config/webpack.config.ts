import loadNextWebpackConfig from './src/index';
import type webpack from 'webpack';
import path from 'path';

export default async function config() {
  // @ts-ignore
  const { default: ChunksWebpackPlugin } = await import(
    // @ts-ignore
    'chunks-webpack-plugin'
  );
  const config: webpack.Configuration = await loadNextWebpackConfig({
    cwd: __dirname,
    dev: process.env.NODE_ENV !== 'production',
  });
  config.entry = {
    page1: path.join(__dirname, 'app/entries', 'page1.tsx'),
    page2: path.join(__dirname, 'app/entries', 'page2.tsx'),
  };

  config.plugins!.push(
    new ChunksWebpackPlugin({
      generateChunksManifest: true,
      generateChunksFiles: false,
    }),
  );
  return config;
}
