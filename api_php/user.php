<?php 
    
    require 'config.php';
    require 'libs/facebook.php';

    // ========================================
    // ========================================
    // CREATE
    // ========================================
    // ========================================
    if($_SERVER['REQUEST_METHOD'] == 'POST' && $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] == null) {
        // read parameteres
        $rawJSONString = file_get_contents('php://input');
        $item = json_decode($rawJSONString);
        
        $fbToken = $item->fbToken; //alphanumeric
        $package = $item->package;
           
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
            
            # the data to insert  
            $data = array( 
                'username' => "new user", 
                'package' => $package,
                'age' => getAge($user_profile['birthday']), 
                'gender' => $user_profile['gender'],
                'email' => $user_profile['email'],
                'ip' => $_SERVER['REMOTE_ADDR'],
                'fbToken' => $fbToken,
                'fbUid' => $user_profile['id'],
                'fbLocationId' => $user_profile['location']['id'],
                'fbLocation' => $user_profile['location']['name'],
            );  
    
            try {    
                # create the SQL statement and execute it  
                $STH = $DB->prepare("INSERT INTO users (
                    username,
                    package,
                    age,
                    gender,
                    email,
                    ip,
                    fbToken,
                    fbUid,
                    fbLocationId,
                    fbLocation
                ) value (
                    :username,
                    :package,
                    :age,
                    :gender,
                    :email,
                    :ip,
                    :fbToken,
                    :fbUid,
                    :fbLocationId,
                    :fbLocation
                )");  
                $STH->execute($data);
            } catch (PDOException $e) {
                header( 'HTTP/1.1 400: BAD REQUEST' );
                echo json_encode(array("status"=>"Could not update the database."));
                file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
            }
    
            if($DB->lastInsertId() > 0) {
                // SUCCESS! Everything is ok, return a json object back to the app
                header('HTTP/1.1 200 OK');
                $data['id'] = $DB->lastInsertId();
                $data['status'] = 'success';
                echo json_encode($data);
            } else {
                header( 'HTTP/1.1 400: BAD REQUEST' );
                echo json_encode(array("status"=>"Could not update the database."));
                file_put_contents('InstasodaAPIstatus.txt', "error3", FILE_APPEND);
            }
            
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
    // UPDATE
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
            
            # the data to update  
            $data = array( 
                'username' => $username, 
                'package' => $package,
                'age' => getAge($user_profile['birthday']), 
                'gender' => $user_profile['gender'],
                'email' => $user_profile['email'],
                'ip' => $_SERVER['REMOTE_ADDR'],
                'fbToken' => $fbToken,
                'fbUid' => $user_profile['id'],
                'fbLocationId' => $user_profile['location']['id'],
                'fbLocation' => $user_profile['location']['name'],
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
                    ip = :ip,
                    fbToken = :fbToken,
                    fbUid = :fbUid,
                    fbLocationId = :fbLocationId,
                    fbLocation = :fbLocation 
                    
                    WHERE id = :id
                ");  
                $STH->execute($data);
            } catch (PDOException $e) {
                header( 'HTTP/1.1 400: BAD REQUEST' );
                echo json_encode(array("status"=>"Could not update the database."));
                file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
            }
    
            // SUCCESS! Everything is ok, return a json object back to the app
            header('HTTP/1.1 200 OK');
            $data['status'] = 'success';
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
    
    function getAge( $p_strDate ) {
        list($d,$m,$Y)    = explode("/",$p_strDate);
        return( date("md") < $m.$d ? date("Y")-$Y-1 : date("Y")-$Y );
    }
?>