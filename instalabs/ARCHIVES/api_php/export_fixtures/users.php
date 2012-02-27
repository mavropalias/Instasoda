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
            $STH = $DB->prepare('SELECT username AS u, package AS pkg, age, gender AS gndr, email, aboutMe AS about, interestedInMen AS men, interestedInWomen AS women, photos, ip, loggedIn, fbToken, fbUid, fbLocationId, fbLocation, fbRelationshipStatus, fbEducation, fbTimezone, fbWallCount, fbVerified, fbThirdPartyId, fbIsMinor, fbInspirationalPeople, fbLanguages, fbLikesCount, fbFriendCount FROM users');
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
            
            // fetch all user's likes
              try {
                  $STHLikes = $DB->prepare("SELECT likes.id FROM likes, users_likes WHERE likes.id = users_likes.likeId AND users_likes.userId = '".$row->fbThirdPartyId."'");
                  $STHLikes->setFetchMode(PDO::FETCH_ASSOC);
                  $STHLikes->execute();
              } catch (PDOException $e) {
                  header( 'HTTP/1.1 400: BAD REQUEST' );
                  echo json_encode(array("status"=>"Could not read database2."));
                  file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
                  die();
              }
              $rowLikes = $STHLikes->fetchAll();
              $arrayLikes = array();
              foreach($rowLikes as $key => $element){
                array_push($arrayLikes, $element['id']);
              }
              $row->likes = $arrayLikes;
            
            // convert photos string to array
              $photosArray = explode(",", $row->photos);
              /*$photosObject = array('photos' => $photosArray);*/
              // remove empty strings
                foreach($photosArray as $key => $element){
                  if($element === "") unset($photosArray[$key]);               
                }
                
              $row->photos = $photosArray;
            
            // output user's data  
            if($n > 0) echo(',');
            echo json_encode($row);
            
            // increment counter
            $n++;            
        }
        echo (']');    
    }   
?>