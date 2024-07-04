# load-next-webpack-config
load webpack config from nextjs

## usage
```
npm i webpack webpack-cli webpack-dev-server next load-next-webpack-config
```

webpack.config.js

```js

import loadNextWebpackConfig from "load-next-webpack-config";
import path from 'path';

export default async function config() {
  const config = await loadNextWebpackConfig({
    cwd: __dirname,
    dev: process.env.NODE_ENV !== 'production',
  });
  config.entry = {
    'page1': path.join(__dirname, 'app/entries', 'page1.tsx'),
    'page2': path.join(__dirname, 'app/entries', 'page2.tsx'),
  };
  return config;
}

```
