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
            $STH = $DB->prepare('SELECT 
              username AS u, 
              package AS p, 
              age AS a, 
              gender AS g, 
              email AS e, 
              aboutMe AS ab, 
              interestedInMen AS m, 
              interestedInWomen AS w, 
              photos, 
              ip, 
              loggedIn AS lin, 
              fbToken AS fbTk, 
              fbUid, 
              fbLocationId AS fbLid, 
              fbLocation AS fbL, 
              fbRelationshipStatus AS fbR, 
              fbEducation AS fbE, 
              fbTimezone AS fbTz, 
              fbWallCount AS fbW, 
              fbVerified AS fbV, 
              fbThirdPartyId AS fbTid, 
              fbIsMinor AS fbM, 
              fbInspirationalPeople AS fbI, 
              fbLanguages AS fbLng, 
              fbLikesCount AS fbLks, 
              fbFriendCount AS fbF 
              
              FROM users');
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
                  $STHLikes = $DB->prepare("SELECT likes.id FROM likes, users_likes WHERE likes.id = users_likes.likeId AND users_likes.userId = '".$row->fbTid."'");
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
              $row->l = $arrayLikes;
            
            // convert 'photos' string to array
              $photosArray = explode(",", $row->photos);
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