<?php 
    
    require '../config.php';    

    
    // ===================================================
    // ===================================================
    // READ (GET)
    // e.g. http://instasoda.com/api/mosaic/story.php?id=1
    // ===================================================
    // ===================================================
    if($_SERVER['REQUEST_METHOD'] == 'GET') {
    		
        $data = array( 
            'id' => $_GET['id']
				);

        try {
            $STH = $DB->prepare('SELECT *  FROM posts WHERE id = :id LIMIT 1');
            $STH->setFetchMode(PDO::FETCH_OBJ);
            $STH->execute($data);
        } catch (PDOException $e) {
            header( 'HTTP/1.1 400: BAD REQUEST' );
            echo json_encode(array("status"=>"Could not read database."));
            file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
            die();
        }

        header('HTTP/1.1 200 OK');
        $row = $STH->fetch();
				echo json_encode($row); 
    }


    // ===================================================
    // ===================================================
    // CREATE (POST)
    // ===================================================
    // ===================================================
    if($_SERVER['REQUEST_METHOD'] == 'POST' && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] == null) {
        	
        $rawJSONString = file_get_contents('php://input');
        $item = json_decode($rawJSONString);
				
        $data = array( 
        		'author' => $item->author,
            'content' => $item->content,
            'title' => $item->title,
            'admin_post' => 0,
				);

        try {
            $STH = $DB->prepare('INSERT INTO posts (author, content, title, admin_post) VALUES (:author, :content, :title, :admin_post)');
            $STH->setFetchMode(PDO::FETCH_OBJ);
            $STH->execute($data);
        } catch (PDOException $e) {
            header( 'HTTP/1.1 400: BAD REQUEST' );
            echo json_encode(array("status"=>"Could not read database."));
            file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
            die();
        }
				
				$data['id'] = $DB->lastInsertId();

        header('HTTP/1.1 200 OK');
				echo json_encode($data); 
    } 
?>