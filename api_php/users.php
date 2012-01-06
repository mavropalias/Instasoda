<?php 
    
    require 'config.php';    

    // ======================================== 
    // ========================================
    // READ (GET)
    // ========================================
    // ========================================
    if($_SERVER['REQUEST_METHOD'] == 'GET' || true) {
        try {
            $STH = $DB->prepare('SELECT username, age, gender, interestedInMen, interestedInWomen, photos, fbThirdPartyId FROM users');
            $STH->setFetchMode(PDO::FETCH_OBJ);
            $STH->execute($detectId);
        } catch (PDOException $e) {
            header( 'HTTP/1.1 400: BAD REQUEST' );
            echo json_encode(array("status"=>"Could not read database."));
            file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
            die();
        }

        header('HTTP/1.1 200 OK');
        echo ('[');
        $n = 0;
        while($row = $STH->fetch()) {  
            if($n > 0) echo(',');
            echo json_encode($row);
            $n++;            
        }
        echo (']');    
    }   
?>