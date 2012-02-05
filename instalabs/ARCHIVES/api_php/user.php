<?php 
    
    require 'config.php';
    require 'libs/facebook.php';
    require 'libs/instasodaHelperFunctions.php';
    
    
    // ========================================
    // ========================================
    // DEBUG
    // ========================================
    // ========================================
    
        /*$rawJSONString = file_get_contents('php://input');
        $item = json_decode($rawJSONString);
        file_put_contents('debug.txt', serialize(($item->photos)), FILE_APPEND);
        file_put_contents('debug2.txt', unserialize(serialize($item->photos)), FILE_APPEND);*/
       
       
    // ========================================
    // ========================================
    // AUTHORIZATION
    // ========================================
    // ========================================

        $sApiSecretKey = "aG35svDHJURCG35253dCFDC69fvsf3fhg0f";
        if($_GET['skey'] != $sApiSecretKey) die("Authorization failed - ip/datetime logged.");
    
    // ========================================
    // ========================================
    // CREATE (POST)
    // ========================================
    // ========================================
    if($_SERVER['REQUEST_METHOD'] == 'POST' && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] == null) {
        // read parameteres
        $rawJSONString = file_get_contents('php://input');
        $item = json_decode($rawJSONString);
        
        $fbToken = $item->fbToken; //alphanumeric
        $package = $item->package;
        
        //debug
        //$fbToken = $_GET['fbToken'];
        //$package = 3;
           
        // FB SDK   
        $facebook = new Facebook(array(
          'appId'  => '159444727449256',
          'secret' => '4b38bb1933886d02182abd08ceb33d64',
          'cookie' => true
        ));
        
        // set access token
        $facebook->setAccessToken($fbToken);
        
        // get user ID
        $user = $facebook->getUser();
       
        if ($user) {
          try {
            // we have a logged in user who's authenticated
            $user_profile = $facebook->api('/me');
            $fbUid = $user_profile['id'];
            
            //print_r($user_profile);
            
            // check if the current Facebook account is already connected to instasoda
            $detectId = array('fbUid' => $fbUid);
            
            try {
                $STH = $DB->prepare('SELECT * FROM users WHERE fbUid = :fbUid LIMIT 1');
                $STH->setFetchMode(PDO::FETCH_OBJ);
                $STH->execute($detectId);
            } catch (PDOException $e) {
                header( 'HTTP/1.1 400: BAD REQUEST' );
                echo json_encode(array("status"=>"Could not read database."));
                file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
            }
            $row = $STH->fetch();
            
            $userHashId = "";
            if($row->id > 0) {
                // user already exists -> return data
                $data = array( 
                    'id' => $row->id,
                    'username' => $row->username, 
                    'package' => $row->package,
                    'age' => $row->age, 
                    'gender' => $row->gender,
                    'email' => $row->email,
                    'aboutMe' => $row->aboutMe,
                    'interestedInMen' => ($row->interestedInMen == 1 ? true : false),
                    'interestedInWomen' => ($row->interestedInWomen == 1 ? true : false),
                    'photos' => $row->photos,
                    'ip' => $row->ip,
                    'fbToken' => $row->fbToken,
                    'fbUid' => $row->fbUid,
                    'fbLocationId' => $row->fbLocationId,
                    'fbLocation' => $row->fbLocation,
                    'fbRelationshipStatus' => $row->fbRelationshipStatus,
                    'fbEducation' => $row->fbEducation,
                    'fbTimezone' => $row->fbTimezone,
                    'fbWallCount' => $row->fbWallCount,
                    'fbVerified' => $row->fbVerified,
                    'fbThirdPartyId' => $row->fbThirdPartyId,
                    'fbInspirationalPeople' => $row->fbInspirationalPeople,
                    'fbLanguages' => $row->fbLanguages,
                    'fbLikesCount' => $row->fbLikesCount,
                    'fbFriendCount' => $row->fbFriendCount,
                    'status' => 'success'
                );
                $userHashId = $row->fbThirdPartyId;
            } else {
                // user does not exist -> create a record
                
                // 1. Fetch user's basic information  
                    
                    // query for extended data
                    $fql = "SELECT timezone,wall_count,verified,third_party_id,inspirational_people,languages,likes_count,friend_count FROM user WHERE uid = '".$fbUid."'";       
                    $queryUrl = "https://api.facebook.com/method/fql.query?format=json&access_token=".$fbToken."&query=".urlencode($fql);
                    $fqlResult = json_decode(fetchUrl($queryUrl));
                    $userHashId = $fqlResult[0]->third_party_id;
                                       
                    $data = array( 
                        'username' => "new user", 
                        'package' => $package,
                        'age' => getAge($user_profile['birthday']), 
                        'gender' => $user_profile['gender'],
                        'email' => $user_profile['email'],
                        'aboutMe' => $item->aboutMe,
                        'interestedInMen' => $item->interestedInMen,
                        'interestedInWomen' => $item->interestedInWomen,
                        'photos' => $item->photos,
                        'ip' => $_SERVER['REMOTE_ADDR'],
                        'fbToken' => $fbToken,
                        'fbUid' => $fbUid,
                        'fbLocationId' => $user_profile['location']['id'],
                        'fbLocation' => $user_profile['location']['name'],
                        'fbRelationshipStatus' => $user_profile['relationship_status'],
                        'fbEducation' => $user_profile['education'][(count($user_profile['education'])-1)]['type'],
                        'fbTimezone' => $fqlResult[0]->timezone,
                        'fbWallCount' => $fqlResult[0]->wall_count,
                        'fbVerified' => $fqlResult[0]->verified,
                        'fbThirdPartyId' => $fqlResult[0]->third_party_id,
                        'fbInspirationalPeople' => $fqlResult[0]->inspirational_people,
                        'fbLanguages' => $fqlResult[0]->languages,
                        'fbLikesCount' => $fqlResult[0]->likes_count,
                        'fbFriendCount' => $fqlResult[0]->friend_count,
                    );
                        
                    //debug
                    //print_r($data);
                    //print_r($fqlResult[0]->timezone);
                    //die();
                           
                    try {    
                        # create the SQL statement and execute it  
                        $STH = $DB->prepare("INSERT INTO users (
                            username,
                            package,
                            age,
                            gender,
                            email,
                            aboutMe,
                            interestedInMen,
                            interestedInWomen,
                            photos,
                            ip,
                            fbToken,
                            fbUid,
                            fbLocationId,
                            fbLocation,
                            fbRelationshipStatus,
                            fbEducation,
                            fbTimezone,
                            fbWallCount,
                            fbVerified,
                            fbThirdPartyId,
                            fbInspirationalPeople,
                            fbLanguages,
                            fbLikesCount,
                            fbFriendCount
                        ) VALUES (
                            :username,
                            :package,
                            :age,
                            :gender,
                            :email,
                            :aboutMe,
                            :interestedInMen,
                            :interestedInWomen,
                            :photos,
                            :ip,
                            :fbToken,
                            :fbUid,
                            :fbLocationId,
                            :fbLocation,
                            :fbRelationshipStatus,
                            :fbEducation,
                            :fbTimezone,
                            :fbWallCount,
                            :fbVerified,
                            :fbThirdPartyId,
                            :fbInspirationalPeople,
                            :fbLanguages,
                            :fbLikesCount,
                            :fbFriendCount
                        )");  
                        $STH->execute($data);
                    } catch (PDOException $e) {
                        header( 'HTTP/1.1 400: BAD REQUEST' );
                        echo json_encode(array("status"=>"Could not update the database (101)."));
                        file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
                    }
                    
                    $data['id'] = $DB->lastInsertId();
                    
                    // fetch user's Facebook profile image
                        try {
                            
                            $img = file_get_contents('https://graph.facebook.com/'.$fbUid.'/picture?type=large&access_token='.$fbToken);
                            $path = $fqlResult[0]->third_party_id.'_'.md5($fqlResult[0]->third_party_id).'_'.rand(1, 10000).$_GET['t'];
                            $file = dirname(__file__).'/photos/'.$path;
                            file_put_contents($file, $img);
                            
                                // update database
                                $data = array(
                                    'photos' => $path.',',
                                    'fbThirdPartyId' => $fqlResult[0]->third_party_id
                                );
                                try {
                                    $STH = $DB->prepare("UPDATE users SET photos = :photos WHERE fbThirdPartyId=:fbThirdPartyId");
                                    $STH->execute($data);                
                                } catch (PDOException $e) {
                                    header( 'HTTP/1.1 400: BAD REQUEST' );
                                    echo json_encode(array("status"=>"Could not update the database (101b)."));
                                    file_put_contents('InstasodaPhotoErrors.txt', $e->getMessage(), FILE_APPEND);
                                }
                        } catch (Exception $e) {
                            header( 'HTTP/1.1 400: BAD REQUEST' );
                            echo json_encode(array("status"=>"Could not fetch FB image."));
                            file_put_contents('InstasodaFBerrors.txt', $e->getMessage(), FILE_APPEND);
                        }
                }

                // 2. Fetch all user's likes
                    $offset = 0;
                    $fbLikesResult = new stdClass;
                    do {
                        $queryLikesUrl = "https://graph.facebook.com/".$fbUid."/likes?format=json&limit=5000&offset=".$offset."&access_token=".$fbToken;
                        $queryLikesJson = json_decode(fetchUrl($queryLikesUrl));
                        $fbLikesResult = array_merge((array) $fbLikesResult, (array) $queryLikesJson->{'data'});
                        $offset = $offset + 5000;
                    } while ($queryLikesJson->{'paging'}->{'next'} != "");
                    
                    //debug
                    //print_r($fbLikesResult);die();
                    
                // 2.1 Insert likes into the database
                    $STH = $DB->prepare('
                        INSERT 
                            INTO likes (id,name,category)  
                            VALUES(:id,:name,:category)  
                            ON DUPLICATE KEY 
                                UPDATE name = :name 
                    ');  
                    $STH_likes = $DB->prepare('
                        INSERT 
                            INTO users_likes (userId,likeId)  
                            VALUES(:userId,:likeId)  
                            ON DUPLICATE KEY 
                                UPDATE likeId = :likeId 
                    ');  
                    
                    try { 
                        for($n = 0 ; $n < count($fbLikesResult) ; $n++) {
                            
                            $dataRow = array( 
                                'id' => $fbLikesResult[$n]->id, 
                                'name' => $fbLikesResult[$n]->name,
                                'category' => $fbLikesResult[$n]->category
                            );
                            
                            $dataRow_likes = array( 
                                'userId' => $userHashId, 
                                'likeId' => $fbLikesResult[$n]->id
                            );
                            
                            $STH->execute($dataRow);
                            $STH_likes->execute($dataRow_likes);
                        }
                    } catch (PDOException $e) {
                        header( 'HTTP/1.1 400: BAD REQUEST' );
                        echo json_encode(array("status"=>"Could not update the database (102)."));
                        file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
                    }                    
                    
                // 3. SUCCESS! Everything is ok, return a json object back to the app
                    header('HTTP/1.1 200 OK');
                    $data['status'] = 'success';
                    $data['likes'] = $fbLikesResult;
                    echo json_encode($data);
            
          } catch (FacebookApiException $e) {
            header( 'HTTP/1.1 400: BAD REQUEST' );
            echo json_encode(array("status"=>"Facebook error. Could not access your Facebook account details."));
            file_put_contents('InstasodaFBErrors.txt', $e->getMessage(), FILE_APPEND);
          }
        } else {
            header( 'HTTP/1.1 400: BAD REQUEST' );
            echo json_encode(array("status"=>"Could not connect to your Facebook account."));
            file_put_contents('InstasodaAPIstatus.txt', "error2", FILE_APPEND);
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
        
        $fbToken = $item->fbToken; //alphanumeric
        $package = $item->package;
        $username = $item->username;
        $id = $item->id;
           
        // FB SDK   
        $facebook = new Facebook(array(
          'appId'  => '159444727449256',
          'secret' => '4b38bb1933886d02182abd08ceb33d64',
          'cookie' => true
        ));
        
        // set access token
        $facebook->setAccessToken($fbToken);
        
        // get user ID
        $user = $facebook->getUser();
       
        if ($user) {
          try {
            // we have a logged in user who's authenticated
            $user_profile = $facebook->api('/me');
            
            // 1. Update user's basic information
            
                // query for extended data
                $fql = "SELECT timezone,wall_count,verified,third_party_id,inspirational_people,languages,likes_count,friend_count FROM user WHERE uid = '".$user_profile['id']."'";       
                $queryUrl = "https://api.facebook.com/method/fql.query?format=json&access_token=".$fbToken."&query=".urlencode($fql);
                $fqlResult = json_decode(fetchUrl($queryUrl));
                $userHashId = $fqlResult[0]->third_party_id;
                
                # the data to update  
                $data = array( 
                    'username' => $username, 
                    'package' => $package,
                    'age' => getAge($user_profile['birthday']), 
                    'gender' => $user_profile['gender'],
                    'email' => $user_profile['email'],
                    'aboutMe' => $item->aboutMe,
                    'interestedInMen' => $item->interestedInMen,
                    'interestedInWomen' => $item->interestedInWomen,
                    'photos' => $item->photos,
                    'ip' => $_SERVER['REMOTE_ADDR'],
                    'fbToken' => $fbToken,
                    'fbUid' => $user_profile['id'],
                    'fbLocationId' => $user_profile['location']['id'],
                    'fbLocation' => $user_profile['location']['name'],
                    'fbRelationshipStatus' => $user_profile['relationship_status'],
                    'fbEducation' => $user_profile['education'][0]['type'],
                    'fbTimezone' => $fqlResult[0]->timezone,
                    'fbWallCount' => $fqlResult[0]->wall_count,
                    'fbVerified' => $fqlResult[0]->verified,
                    'fbThirdPartyId' => $fqlResult[0]->third_party_id,
                    'fbInspirationalPeople' => $fqlResult[0]->inspirational_people,
                    'fbLanguages' => $fqlResult[0]->languages,
                    'fbLikesCount' => $fqlResult[0]->likes_count,
                    'fbFriendCount' => $fqlResult[0]->friend_count,
                    'id' => $id
                );  
        
                try {    
                    # create the SQL statement and execute it  
                    $STH = $DB->prepare("UPDATE users SET 
                        username = :username,
                        package = :package,
                        age = :age,
                        gender = :gender,
                        email = :email,
                        aboutMe = :aboutMe,
                        interestedInMen = :interestedInMen,
                        interestedInWomen = :interestedInWomen,
                        photos = :photos,
                        ip = :ip,
                        fbToken = :fbToken,
                        fbUid = :fbUid,
                        fbLocationId = :fbLocationId,
                        fbLocation = :fbLocation,
                        fbRelationshipStatus = :fbRelationshipStatus,
                        fbEducation = :fbEducation,
                        fbTimezone = :fbTimezone,
                        fbWallCount = :fbWallCount,
                        fbVerified = :fbVerified,
                        fbThirdPartyId = :fbThirdPartyId,    
                        fbInspirationalPeople = :fbInspirationalPeople,
                        fbLanguages = :fbLanguages,
                        fbLikesCount = :fbLikesCount,
                        fbFriendCount = :fbFriendCount                  
                        
                        WHERE id = :id
                    ");  
                    $STH->execute($data);
                } catch (PDOException $e) {
                    header( 'HTTP/1.1 400: BAD REQUEST' );
                    echo json_encode(array("status"=>"Could not update the database (101b)."));
                    file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
                }

            // 2. Update all user's likes
                $offset = 0;
                $fbLikesResult = new stdClass;
                do {
                    $queryLikesUrl = "https://graph.facebook.com/".$user_profile['id']."/likes?format=json&limit=5000&offset=".$offset."&access_token=".$fbToken;
                    $queryLikesJson = json_decode(fetchUrl($queryLikesUrl));
                    $fbLikesResult = array_merge((array) $fbLikesResult, (array) $queryLikesJson->{'data'});
                    $offset = $offset + 5000;
                } while ($queryLikesJson->{'paging'}->{'next'} != "");
                
            // 2.1 Insert likes into the database
                $STH = $DB->prepare('
                    INSERT 
                        INTO likes (id,name,category)  
                        VALUES(:id,:name,:category)  
                        ON DUPLICATE KEY 
                            UPDATE name = :name 
                ');  
                $STH_likes = $DB->prepare('
                    INSERT 
                        INTO users_likes (userId,likeId)  
                        VALUES(:userId,:likeId)  
                        ON DUPLICATE KEY 
                            UPDATE likeId = :likeId 
                ');  
                
                try { 
                    for($n = 0 ; $n < count($fbLikesResult) ; $n++) {
                        
                        $dataRow = array( 
                            'id' => $fbLikesResult[$n]->id, 
                            'name' => $fbLikesResult[$n]->name,
                            'category' => $fbLikesResult[$n]->category
                        );
                        
                        $dataRow_likes = array( 
                            'userId' => $userHashId, 
                            'likeId' => $fbLikesResult[$n]->id
                        );
                        
                        $STH->execute($dataRow);
                        $STH_likes->execute($dataRow_likes);
                    }
                } catch (PDOException $e) {
                    header( 'HTTP/1.1 400: BAD REQUEST' );
                    echo json_encode(array("status"=>"Could not update the database (102b)."));
                    file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
                } 
                    
            // SUCCESS! Everything is ok, return a json object back to the app
            header('HTTP/1.1 200 OK');
            $data['status'] = 'success';
            $data['likes'] = $fbLikesResult;
            echo json_encode($data);
            
          } catch (FacebookApiException $e) {
            header( 'HTTP/1.1 400: BAD REQUEST' );
            echo json_encode(array("status"=>"Facebook error. Could not access your Facebook account details."));
            file_put_contents('InstasodaFBErrors.txt', $e->getMessage(), FILE_APPEND);
          }
        } else {
            header( 'HTTP/1.1 400: BAD REQUEST' );
            echo json_encode(array("status"=>"Could not connect to your Facebook account."));
            file_put_contents('InstasodaAPIstatus.txt', "error2", FILE_APPEND);
        }
    }
    // ======================================== 
    // ========================================
    // READ (GET)
    // ========================================
    // ========================================
    else if($_SERVER['REQUEST_METHOD'] == 'GET') {
        
    }   
?>