<?php 
	function send($data)
	{
		require '../connection.php';

		$id_sender = $data['id_sender'];
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

		$query = "SELECT m.id as id, m.body as text, u.name as user, m.send_time as date FROM 
					message m inner join user u on m.id_sender = u.id
				ORDER BY send_time ASC LIMIT " . $start . ", " . $limit;

		if($result = mysqli_query($db, $query)) {
            return mysqli_fetch_all($result, MYSQLI_ASSOC);
        } else {
            return false;
        }
	}