(function(){
    function log(count,word){
        console.log(word+' : '+count);
    }
    
    var ret = trieCount(str);
    console.log(ret);
    var trieAll = {};
    trieTraverse(ret.trie,function(count,word){
        trieAll[word]=count;
        log(count,word);
    });
    console.log('--------------------------');
    var splitHashAll = {};
    ret = splitHashCount(str,function(count,word){
        splitHashAll[word]=count;
         log(count,word);
    });
    console.log(ret);
    console.log('--------------------------');
    console.log(KISSY.equals(trieAll,splitHashAll));
})();