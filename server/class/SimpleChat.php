<?php
date_default_timezone_set('America/Sao_Paulo');
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
        $user = str_replace("u=","",utf8_decode(urldecode($conn->WebSocket->request->getQuery())));
        list($id, $name) = explode(',', $user);
        $conn->app_uid = $id;
        $conn->app_uname = $name;
        $this->clients->attach($conn);

        foreach ($this->clients as $client) {
            $new_user["id"] = $conn->app_uid;
            $new_user["name"] = $conn->app_uname;
            $new_user["newUser"] = true;
            $client->send(json_encode($new_user));
        }
        
        echo "{$conn->app_uname} conectado ({$conn->app_uid})" . PHP_EOL;
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
            $new_user["id"] = $client->app_uid;
            $new_user["name"] = $client->app_uname;
            array_push($seen, $new_user);
        }
        $data->seen = $seen;

        // Passando pelos clientes conectados e enviando a mensagem
        // para cada um deles
        foreach ($this->clients as $client) {
            $client->send(json_encode($data));
        }

        echo "{$from->app_uname} enviou uma mensagem" . PHP_EOL;
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
        echo "{$conn->app_uname} desconectou" . PHP_EOL;
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