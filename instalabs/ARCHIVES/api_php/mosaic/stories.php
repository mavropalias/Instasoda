<?php 
    
    require '../config.php';    

    
    // ===================================================
    // ===================================================
    // READ (GET)
    // e.g. http://instasoda.com/api/mosaic/stories.php
    // ===================================================
    // ===================================================
    if($_SERVER['REQUEST_METHOD'] == 'GET') {
    	
				// fetch all posts
        try {
            $STH = $DB->prepare('SELECT * FROM posts ORDER BY id DESC');
            $STH->setFetchMode(PDO::FETCH_OBJ);
            $STH->execute($data);
        } catch (PDOException $e) {
            header( 'HTTP/1.1 400: BAD REQUEST' );
            echo json_encode(array("status"=>"Could not read database."));
            file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
            die();
        }
				$row = $STH->fetchAll();

        header('HTTP/1.1 200 OK');        
				echo json_encode($row); 
    }
?>