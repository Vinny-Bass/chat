<?php

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class SimpleChat implements MessageComponentInterface
{
    /** @var SplObjectStorage  */
    protected $clients;

    /**
     * SimpleChat constructor.
     */
    public function __construct()
    {
        // Iniciamos a coleção que irá armazenar os clientes conectados
        $this->clients = new \SplObjectStorage;
    }

    /**
     * Evento que será chamado quando um cliente se conectar ao websocket
     *
     * @param ConnectionInterface $conn
     */
    public function onOpen(ConnectionInterface $conn)
    {
        // Adicionando o cliente na coleção e pegando id dele
        $id = str_replace("u=","",$conn->WebSocket->request->getQuery());
        $conn->app_uid = $id;
        $this->clients->attach($conn);

        foreach ($this->clients as $client) {
            $client->send(json_encode($conn->app_uid));
        }

        echo "Cliente conectado ({$conn->app_uid})" . PHP_EOL;
    }

    /**
     * Evento que será chamado quando um cliente enviar dados ao websocket
     *
     * @param ConnectionInterface $from
     * @param string $data
     */
    public function onMessage(ConnectionInterface $from, $data)
    {
        // Convertendo os dados recebidos para vetor e adicionando a data
        $data = json_decode($data);
        $data->date = date('d/m/Y H:i:s');
        
        //Adiciona todos os usuários que visualizaram a mensagem
        $seen = [];
        foreach ($this->clients as $client) {
            array_push($seen, $client->app_uid);
        }
        $data->seen = $seen;

        // Passando pelos clientes conectados e enviando a mensagem
        // para cada um deles
        foreach ($this->clients as $client) {
            $client->send(json_encode($data));
        }

        echo "Cliente {$from->app_uid} enviou uma mensagem" . PHP_EOL;
    }

    /**
     * Evento que será chamado quando o cliente desconectar do websocket
     *
     * @param ConnectionInterface $conn
     */
    public function onClose(ConnectionInterface $conn)
    {
        // Retirando o cliente da coleção
        $this->clients->detach($conn);
        echo "Cliente {$conn->app_uid} desconectou" . PHP_EOL;
    }

    /**
     * Evento que será chamado caso ocorra algum erro no websocket
     *
     * @param ConnectionInterface $conn
     * @param Exception $e
     */
    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        // Fechando conexão do cliente
        $conn->close();

        echo "Ocorreu um erro: {$e->getMessage()}" . PHP_EOL;
    }
}