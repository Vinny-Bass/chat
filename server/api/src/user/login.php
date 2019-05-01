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

if($result = login($data)) {

	if (strpos($result, 'Error') !== false) {
		response(200, "Usuario Logado", $result);
	}
	else {
		response(200, $result, null);
	}	
} else {
	response(400, "Invalid Request", NULL);
}