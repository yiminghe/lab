import { getCacheItem, cacheAsync } from "../src/index";

const sleep = (t = 100) => new Promise(r => setTimeout(r, t));
async function okAsync(id:number) {
 
  await sleep();
   if(id>100){
    throw new Error(id+' run okAsync error');
  }
  await sleep();
  console.log('run okAsync: '+id,Date.now());
  return id;
}

async function test1(tag:string) {
  console.log('start',tag);
  let id=0;
  const start = Date.now();
  const cached = cacheAsync(() => 'okAsync', 500, okAsync);
  const promises = [];
  promises.push(cached(++id));
  promises.push(cached(++id));
  await sleep(100);
  promises.push(cached(++id));
  const ret=await Promise.all(promises);
  console.log(tag, Date.now() - start,ret)
   console.log(tag,'cache',!!getCacheItem('okAsync'));
  cached.removeCache(0);
  console.log(tag,'cache',!!getCacheItem('okAsync'));
  await sleep(1000);
  console.log(tag,'cache',!!getCacheItem('okAsync'));
  console.log()
}

async function test2(tag:string) {
   console.log('start',tag);
  const start = Date.now();
   let id=0;
  const cached = cacheAsync(() => 'okAsync', 500, okAsync);
  const promises = [];
  promises.push(cached(++id));
  promises.push(cached(++id));
  await sleep(500);
  promises.push(cached(++id));
  const ret=await Promise.all(promises);
  console.log(tag, Date.now() - start,ret)
   console.log(tag,'cache',!!getCacheItem('okAsync'));
  cached.removeCache(0);
  console.log(tag,'cache',!!getCacheItem('okAsync'));
  await sleep(1000);
  console.log(tag,'cache',!!getCacheItem('okAsync'));
   console.log()
}

async function test3(tag:string) {
   console.log('start',tag);
    let id=0;
  const start = Date.now();
  const cached = cacheAsync(() => 'okAsync', 500, okAsync);
  const promises = [];
  promises.push(cached(++id));
  promises.push(cached(++id));
  await sleep(500);
  // stale one
  promises.push(cached(++id));
  // wait for latest
   await sleep(300);
    promises.push(cached(++id));
   const ret=await Promise.all(promises);
  console.log(tag, Date.now() - start,ret)
   console.log(tag,'cache',!!getCacheItem('okAsync'));
  cached.removeCache(0);
  console.log(tag,'cache',!!getCacheItem('okAsync'));
  await sleep(1000);
  console.log(tag,'cache',!!getCacheItem('okAsync'));
   console.log()
}


async function test4(tag:string) {
  console.log('start',tag);
  let id=0;
  const start = Date.now();
  const cached = cacheAsync(() => 'okAsync', 500, okAsync);
  let  promises = [];
  promises.push(cached(101));
  promises.push(cached(102));
  
  try{
    await promises[0];
  } catch(e:any){
    console.log(e.message);
  }
  try{
    await promises[1];
  } catch(e:any){
    console.log(e.message);
  }

  promises = [];
  promises.push(cached(++id));
  promises.push(cached(++id));
   promises.push(cached(101));
   const ret=await Promise.all(promises);
  console.log(tag, Date.now() - start,ret)
  cached.removeCache(0);
  console.log(tag,'cache',!!getCacheItem('okAsync'));
  await sleep(1000);
  console.log(tag,'cache',!!getCacheItem('okAsync'));
   console.log()
}

async function test5(tag:string) {
   console.log('start',tag);
   const cached = cacheAsync(() => 'okAsync', 50, okAsync);
   const promises=[];
   promises.push(cached(1));
   await sleep(51);
 promises.push(cached(101));
  await sleep(110);
   promises.push(cached(2));

   let index=0;
for(const p of promises){
   try{
    const id=await p;
    console.log('tag',index,id);
  } catch(e:any){
    console.log('tag',index,e.message);
  }
  ++index;
}
console.log(tag,'cache',!!getCacheItem('okAsync'));
 cached.removeCache(0);
  console.log(tag,'cache',!!getCacheItem('okAsync'));
  await sleep(1000);
  console.log(tag,'cache',!!getCacheItem('okAsync'));
   console.log()
 
}
(async function () {
  await test1('d1');
   await test2('d2');
     await test3('d3');
     await test4('d4')
       await test5('d5')
})();