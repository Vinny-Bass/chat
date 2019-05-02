<?php 
	function send($data)
	{
		require '../connection.php';

		$id_sender = $data['id'];
		$body = $data['body'];

		$query = "INSERT INTO message (id_sender, body, send_time) VALUES ('$id_sender', '$body', NOW())";

		if(mysqli_query($db, $query)) {
            return true;
        } else {
            return false;
        }
	}

	function get_all($data)
	{
		require '../connection.php';
		
		$limit = $data['limit'] ? intval($data['limit']) : 20;
		$start = $data['start'] ? $data['start'] : 0;

		$query = "SELECT * FROM message LIMIT $limit";

		if($result = mysqli_query($db, $query)) {
            return mysqli_fetch_assoc($result);
        } else {
            return false;
        }
	}