<?php 
    
    require '../config.php';    
    
    // ========================================
    // ========================================
    // AUTHORIZATION
    // ========================================
    // ========================================

        $sApiSecretKey = "aG35svDHJURCG35253dCFDC69fvsf3fhg0f";
        if($_GET['skey'] != $sApiSecretKey) die("Authorization failed - ip/datetime logged.");
    
    // ======================================== 
    // ========================================
    // READ (GET)
    // ========================================
    // ========================================
    if($_SERVER['REQUEST_METHOD'] == 'GET' || true) {
        try {
            $STH = $DB->prepare('SELECT id AS id, name AS n, category AS c FROM likes');
            $STH->setFetchMode(PDO::FETCH_OBJ);
            $STH->execute();
        } catch (PDOException $e) {
            header( 'HTTP/1.1 400: BAD REQUEST' );
            echo json_encode(array("status"=>"Could not read database. ".$e));
            file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
            die();
        }

        header('HTTP/1.1 200 OK');
        echo ('[');
        $n = 0;
        while($row = $STH->fetch()) {

            if($n > 0) echo(',');
            echo json_encode($row);
            
            // increment counter
            $n++;            
        }
        echo (']');    
    }   
?>