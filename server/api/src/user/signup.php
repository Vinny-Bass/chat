<?php 
header("Content-Type:application/json");
require 'data.php';

$data = json_decode(file_get_contents('php://input'), true);

if (
	!empty($data) &&
	isset($data["name"]) &&
	isset($data["email"]) &&
	isset($data["pass"])
	) {
		
	$result = save_user($data);
	
	if (!is_string($result)) {
		response(200, "User created", $result);
	}
	else {
		response(200, $result, null);
	}	
}
else {
	response(400, "Invalid Request", NULL);
}

function response($status,$status_message,$data) {
	header("HTTP/1.1 ".$status);
	
	$response['status'] = $status;
	$response['status_message'] = $status_message;
	$response['data'] = $data;
	
	$json_response = json_encode($response);
	echo $json_response;
}

?>