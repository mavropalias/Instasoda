<?php 
    
    require '../config.php';    

    if($_SERVER['REQUEST_METHOD'] == 'GET') {
    	
		// delete all posts
        try {
            $STH = $DB->prepare('DELETE FROM comments');
            $STH->execute($data);
			
            $STH = $DB->prepare('DELETE FROM posts');
            $STH->execute($data);
        } catch (PDOException $e) {
            header( 'HTTP/1.1 400: BAD REQUEST' );
            echo json_encode(array("status"=>$e));
            file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
            die();
        }
				//$row = $STH->fetchAll();

        header('HTTP/1.1 200 OK');        
				//echo json_encode($row);
				echo ("db cleared");
    }
?>