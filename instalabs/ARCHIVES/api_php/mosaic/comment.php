<?php 
    
    require '../config.php';    

    
    // ===================================================
    // ===================================================
    // CREATE (POST)
    // ===================================================
    // ===================================================
    if($_SERVER['REQUEST_METHOD'] == 'POST' && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] == null) {
        	
        $rawJSONString = file_get_contents('php://input');
        $item = json_decode($rawJSONString);
				
        $data = array( 
        		'postId' => $item->postId,
            'author' => $item->author,
            'content' => $item->content,
            'ip' => $_SERVER['REMOTE_ADDR'],
				);

        try {
            $STH = $DB->prepare('INSERT INTO comments (postId, author, content, ip) VALUES (:postId, :author, :content, :ip)');
            $STH->setFetchMode(PDO::FETCH_OBJ);
            $STH->execute($data);
        } catch (PDOException $e) {
            header( 'HTTP/1.1 400: BAD REQUEST' );
            echo json_encode(array("status"=>$e->getMessage()));
            file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
            die();
        }
				
				$data['id'] = $DB->lastInsertId();

        header('HTTP/1.1 200 OK');
				echo json_encode($data); 
    } 
?>