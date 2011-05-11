var net = require('net');
var con=net.createConnection(8124);
con.setEncoding("utf-8");
con.on("connect",function(){
    var i=0;
    
    setInterval(function(){       
        console.log("connected,send hello"+i); 
        con.write("hello"+i);
        i++;
    },1000);
    
    
    
});

con.on("data",function(data){
    console.log("receive data : ");
    console.log(data);
});