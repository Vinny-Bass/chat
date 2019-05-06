<?php

    function save_user($data){
        require '../connection.php';

        $top = "
            INSERT INTO
            user (name, email, password, creation";

        $bottom = ") 
            VALUES (
            '" . $data["name"] . "', 
            '" . $data["email"] . "',
            '" . $data["pass"] . "',
            now()";

        if (isset($data["birth"]) && !empty($data["birth"])) {
            $top = $top . ", birth";
            $bottom = $bottom . ", '" . $data["birth"] . "'";
        }

        if (isset($data["nationality"]) && !empty($data["nationality"])) {
            $top = $top . ", nationality";
            $bottom = $bottom . ", '" . $data["nationality"] . "'";
        }

        if (isset($data["title"]) && !empty($data["title"])) {
            $top = $top . ", title";
            $bottom = $bottom . ", '" . $data["title"] . "'";
        }

        if (isset($data["research"]) && !empty($data["research"])) {
            $top = $top . ", research";
            $bottom = $bottom . ", '" . $data["research"] . "'";
        }

        if (isset($data["college_degree"]) && !empty($data["college_degree"])) {
            $top = $top . ", college_degree";
            $bottom = $bottom . ", '" . $data["college_degree"] . "'";
        }

        if (isset($data["work_location"]) && !empty($data["work_location"])) {
            $top = $top . ", work_location";
            $bottom = $bottom . ", '" . $data["work_location"] . "'";
        }

        $sql = $top . $bottom . ")";

        if (mysqli_query($db, $sql)) {
            return array('id' => mysqli_insert_id($db));
            
        } else {
            return "Error: " . $sql . "<br>" . mysqli_error($db);
        }
    }

    function login($data) 
    {
        require '../connection.php';

        $email = $data['email'];
        $pass = $data['pass'];

        $query = "SELECT id FROM user WHERE email = '$email' AND password = '$pass'";

        if($result = mysqli_query($db, $query)) {
            return mysqli_fetch_assoc($result);
        } else {
            return false;
        }
    }

    function get_infos($data)
    {
        require '../connection.php';
        
        $id_user = $data['id'];

        $query  ="SELECT * FROM user WHERE id = '$id_user'";

        if($result = mysqli_query($db, $query)) {
            return mysqli_fetch_assoc($result);
        } else {
            return false;
        }
    }

    function set_online($data)
    {
        require '../connection.php';

        $id_user = $data['id'];
        $online = $data['online'];

        $query = "UPDATE user SET online = '$online' WHERE id = '$id_user'";

        if($result = mysqli_query($db, $query)) {
            return true;
        } else {
            return false;
        }
    }

    function user_exists($u_name, $u_email)
    {
        require '../connection.php';

        $query = "SELECT name, email FROM user WHERE name = '$u_name' OR email = '$u_email'";

        $status["invalid_email"] = false;
        $status["invalid_name"] = false;

        if($result = mysqli_query($db, $query)) {
            $user = mysqli_fetch_all($result, MYSQLI_ASSOC);

            foreach($user as $key => $u){
                if ($u["email"] == $u_email)
                    $status["invalid_email"] = true;
                
                if ($u["name"] == $u_name)
                    $status["invalid_name"] = true;
            }

            return $status;
        } else {
            return $status;
        }
    }

?>