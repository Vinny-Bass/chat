<?php 
	function send($data)
	{
		require '../connection.php';

		$id_sender = $data['id_sender'];
		$body = $data['body'];

		$query = "INSERT INTO message (id_sender, body, send_time) VALUES ('$id_sender', '$body', NOW())";

		if(mysqli_query($db, $query)) {
            return mysqli_insert_id($db);
        } else {
            return false;
        }
	}

	function get_all($data)
	{
		require '../connection.php';
		
		$limit = array_key_exists('limit', $data) ? intval($data['limit']) : 20;
		$start = array_key_exists('start', $data)? $data['start'] : 0;

		$query = "SELECT m.id as id, m.body as text, u.name as name, u.id as id_user, m.send_time as date 
					FROM message m 
					INNER JOIN user u on m.id_sender = u.id 
					ORDER BY send_time 
					DESC LIMIT " . $start . ", " . $limit;

		if($result = mysqli_query($db, $query)) {
            return mysqli_fetch_all($result, MYSQLI_ASSOC);
        } else {
            return false;
        }
	}

	function getOnlineUsers()
	{
		require '../connection.php';

		$query = "SELECT id FROM user WHERE online = 1";

		if($result = mysqli_query($db, $query)) {
            return mysqli_fetch_all($result, MYSQLI_ASSOC);
        } else {
            return false;
        }
	}

	function see_message($id_message, $id_user)
	{
		require '../connection.php';

		$query = "INSERT INTO seen (id_message, id_viewer, seen_time) VALUES ('$id_message', '$id_user', NOW())";

		if(mysqli_query($db, $query)) {
            return true;
        } else {
            return false;
        }
	}

	function get_visualizers($id_message)
	{
		require '../connection.php';

		$query = "SELECT s.seen_time, u.name, u.id as id_user
					FROM seen s
					INNER JOIN message m ON s.id_message = m.id 
					INNER JOIN user u ON s.id_viewer = u.id
					WHERE m.id = '$id_message'
					ORDER BY seen_time ASC";

		if($result = mysqli_query($db, $query)) {
            return mysqli_fetch_all($result, MYSQLI_ASSOC);
        } else {
            return false;
        }
	}