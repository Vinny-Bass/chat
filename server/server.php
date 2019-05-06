<?php

use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;

// Incluindo biblioteca e classe do chat
require 'vendor/autoload.php';
require 'class/SimpleChat.php';

// Iniciando conexão
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new SimpleChat()
        )
    ),
    80
);

echo "Server runing..";
$server->run();