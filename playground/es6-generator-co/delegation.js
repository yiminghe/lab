
    function *nest(){
        for(var i=10;i<15;i++){
            yield i;
        }
    }
    
    function *outer(){
        for(var i=1;i<5;i++){
            yield i;
        }
        yield* nest();
        return "xx";
    }
    
    var gen = outer();
    var ret;
    do {
        ret = gen.next();
        console.log(ret.value);
    } while(!ret.done);
