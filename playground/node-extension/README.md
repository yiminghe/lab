# extension-loader

import without file extension inside nodejs

## usage

index.ts:
```ts
const x:string = '1';
console.log(x);
```
run:
```
node --experimental-transform-types --import=@yiminghe/node-extension/register.js index
```