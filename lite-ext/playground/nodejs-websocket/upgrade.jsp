<%@ page import="java.io.Reader" %>
<%@ page import="java.util.Enumeration" %>
<%@ page import="java.io.BufferedReader" %>
<%@ page import="java.util.Arrays" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%

    String key1Str = request.getHeader("Sec-WebSocket-Key1");
    String key2Str = request.getHeader("Sec-WebSocket-Key2");

    

    Enumeration names = request.getHeaderNames();
    while (names.hasMoreElements()) {
        String name = (String) names.nextElement();
        System.out.println(name + " : " + request.getHeader(name));
    }

    byte[] bs = new byte[8];
    ServletInputStream in = request.getInputStream();
    in.mark(10000);
    request.getInputStream().read(bs, 0, 8);
    System.out.println(Arrays.toString(bs));


    //String key3Str = r.readLine();
//    System.out.println(key1Str);
//    System.out.println(key2Str);
//    System.out.println(key3Str);

%>