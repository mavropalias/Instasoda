<?php 
    
    require 'config.php';    
    require 'libs/facebook.php';
    require 'libs/instasodaHelperFunctions.php';
    
    // ======================================== 
    // ========================================
    // READ (GET)
    // ========================================
    // ========================================
    if($_SERVER['REQUEST_METHOD'] == 'GET' || true) {
        try {
            $STH = $DB->prepare('SELECT username, age, gender, interestedInMen, interestedInWomen, photos, fbThirdPartyId, aboutMe, fbUid, fbToken, fbLikesCount  FROM users');
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
            // fetch all user's likes
            $offset = 0;
            $fbLikesResult = new stdClass;
            do {
                $queryLikesUrl = "https://graph.facebook.com/".$row->fbUid."/likes?format=json&limit=5000&offset=".$offset."&access_token=".$row->fbToken;
                $queryLikesJson = json_decode(fetchUrl($queryLikesUrl));
                $fbLikesResult = array_merge((array) $fbLikesResult, (array) $queryLikesJson->{'data'});
                $offset = $offset + 5000;
            } while ($queryLikesJson->{'paging'}->{'next'} != "");
            $row->likes = $fbLikesResult;
            
            // output user's data  
            if($n > 0) echo(',');
            echo json_encode($row);
            
            // increment counter
            $n++;            
        }
        echo (']');    
    }   
?>