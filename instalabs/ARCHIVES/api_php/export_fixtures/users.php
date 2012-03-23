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
              age AS ag, 
              gender AS fS, 
              email AS fE, 
              aboutMe AS a, 
              interestedInMen AS m, 
              interestedInWomen AS w, 
              photos, 
              fbToken AS fTkn, 
              fbUid as fId, 
              fbLocation AS fCl, 
              fbRelationshipStatus AS fRs, 
              fbEducation AS fEd, 
              fbTimezone AS fTz, 
              fbWallCount AS fWc, 
              fbVerified AS fV, 
              fbThirdPartyId AS _id, 
              fbInspirationalPeople AS fIp, 
              fbLanguages AS fLn, 
              fbLikesCount AS fLc, 
              fbFriendCount AS fFc 
              
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
                  $STHLikes = $DB->prepare("SELECT likes.id AS _id, likes.name AS n, likes.category AS c FROM likes, users_likes WHERE likes.id = users_likes.likeId AND users_likes.userId = '".$row->_id."'");
                  $STHLikes->setFetchMode(PDO::FETCH_ASSOC);
                  $STHLikes->execute();
              } catch (PDOException $e) {
                  header( 'HTTP/1.1 400: BAD REQUEST' );
                  echo json_encode(array("status"=>"Could not read database2."));
                  file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
                  die();
              }
              $rowLikes = $STHLikes->fetchAll();
              /*$arrayLikes = array();
              foreach($rowLikes as $key => $element){
                array_push($arrayLikes, $element['_id']);
              }*/
              $row->fL = $rowLikes;
            
            // convert 'photos' string to array and update user object
              $photosArray = explode(",", $row->photos);
              $row->p = array();
              // remove empty strings and rename keys
              foreach($photosArray as $key => $element){
                if($element === "") unset($photosArray[$key]);
                else{   
				          $photo = new stdClass();
                  $photo->f = $element;
                  $photo->p = 1;
                  $photo->d = 1;
                  
                  array_push($row->p, $photo);
                }
              }
              unset($row->photos);
               
            
            // output user's data  
            if($n > 0) echo(',');
            echo json_encode($row);
            
            // increment counter
            $n++;            
        }
        echo (']');    
    }   
?>