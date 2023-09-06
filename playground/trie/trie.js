(function(){
    var startIndex = 'A'.charCodeAt(0);
    
    function isCharactor(c){
        return c>='a' && c<='z' || c>='A'&&c<='Z';
    }
    
    function index(c){
        return c.charCodeAt(0)-startIndex;
    }
    
    function unindex(index){
        return String.fromCharCode(index+startIndex);
    }
    
    function count(str){
        var maxCount=0;
        var maxStart,maxEnd;
        var cur=root = {next:[]}
        var start=0,end;
        var len = str.length;
        for(var i=0;i<len;i++){
            var c=str.charAt(i)
            if(!isCharactor(c)){
                if(cur!==root){
                    cur.count++;
                    if(cur.count>maxCount){
                        maxCount=cur.count;
                        maxStart = start+1;
                        maxEnd = i;
                    }
                    cur=root;
                }
                start = i;
            } else {
                var cIndex =index(c);
                if(!cur.next[cIndex]){
                    cur.next[cIndex] = {
                        count:0,
                        next:[]
                    };
                }
                cur = cur.next[cIndex];
            }
        }
        return {
            trie: root,
            count: maxCount,
            str: str.slice(maxStart,maxEnd)
        };
    }
    
    function traverse(node,log,word){
        word=word||[];
        if(node.count){
            if(log) log(node.count,word.join(''));
        }
        var next = node.next;
        var len = next.length;
        var wordLen = word.length;
        for(var i=0;i<len;i++){
            var c = next[i];
            if(c!==undefined){
                word[wordLen] = unindex(i);
                traverse(c,log,word);
                word.length = wordLen;
            }
        }
    }
    
    window.trieTraverse = traverse;
    window.trieCount = count;
    
    })();