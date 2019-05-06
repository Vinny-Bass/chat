<?php 
header("Content-Type:application/json");
require 'data.php';

function response($status,$status_message,$data) {
	header("HTTP/1.1 ".$status);
	
	$response['status'] = $status;
	$response['status_message'] = $status_message;
	$response['data'] = $data;
	
	$json_response = json_encode($response);
	echo $json_response;
}

$data = json_decode(file_get_contents('php://input'), true);

if($result = get_all($data)) {
	if (!isset($data["id_getter"]))
		response(500, "id_getter precisa ser enviado", NULL);
 
	foreach($result as $key => $msg){
		$result[$key]['seen'] = get_visualizers($msg['id']);

		$already_exists = false;
		foreach($result[$key]['seen'] as $seen) {
			if ($data["id_getter"] == $seen["id_user"]) {
				$already_exists = true;
				break;
			}
		}

		if(!$already_exists) {
			see_message($msg['id'], $data["id_getter"]);
			$result[$key]['seen'] = get_visualizers($msg['id']);
		}
	}

	response(200, "Mensagens encontradas", $result);	
} else {
	response(200, "Nenhuma mensagem encontrada", NULL);
}