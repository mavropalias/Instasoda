<?php 
    
    require 'config.php';
    
    // parameters
    // > a:
    //   1 = put
    //   2 = delete
    
    // ========================================
    // ========================================
    // CREATE (POST)
    // ========================================
    // ========================================
    if(intval($_GET['a']) === 1) {
        // read parameteres
        $img = file_get_contents('php://input');
        
        // Auth user
        $fbThirdPartyId = array('fbThirdPartyId' => $_GET['token']);
        
        try {
            $STH = $DB->prepare('SELECT id, photos FROM users WHERE fbThirdPartyId = :fbThirdPartyId LIMIT 1');
            $STH->setFetchMode(PDO::FETCH_OBJ);
            $STH->execute($fbThirdPartyId);
        } catch (PDOException $e) {
            header( 'HTTP/1.1 400: BAD REQUEST' );
            echo json_encode(array("status"=>"Authorization fail."));
            file_put_contents('InstasodaPhotoErrors.txt', $e->getMessage(), FILE_APPEND);
        }
        $row = $STH->fetch();

        // user exists
        if($row->id > 0) {
            // save image
            $path = $_GET['token'].'_'.md5($img).'_'.rand(1, 10000).$_GET['t'];
            $file = dirname(__file__).'/photos/'.$path;
            file_put_contents($file, $img);
            
            // update database
            $data = array(
                'photos' => ($row->photos).$path.',',
                'fbThirdPartyId' => $_GET['token']
            );
            try {
                $STH = $DB->prepare("UPDATE users SET photos = :photos WHERE fbThirdPartyId=:fbThirdPartyId");
                $STH->execute($data);                
            } catch (PDOException $e) {
                header( 'HTTP/1.1 400: BAD REQUEST' );
                echo json_encode(array("status"=>"Could not update the database (101b)."));
                file_put_contents('InstasodaPhotoErrors.txt', $e->getMessage(), FILE_APPEND);
            }
                
            // return response
            echo json_encode($data);
        }
    }
    // ======================================== 
    // ========================================
    // UPDATE (PUT)
    // ========================================
    // ========================================
    else if($_SERVER['REQUEST_METHOD'] == 'POST' && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] == 'PUT') {                 
        // read parameteres
        $rawJSONString = file_get_contents('php://input');
        $item = json_decode($rawJSONString);
        
        
    }
?>