<?php
header("HTTP/1.1 101 WebSocket Protocol Handshake");
header("Connection:Upgrade");
header("Sec-WebSocket-Location:ws://localhost:8124/");
header("Sec-WebSocket-Origin:http://localhost");
header("Sec-WebSocket-Protocol:*");
header("Upgrade:WebSocket"); ?>
