<?php 

    session_start();
    
	require 'config.php';
    require 'libs/facebook.php';
       
    // FB SDK   
    $facebook = new Facebook(array(
      'appId'  => '159444727449256',
      'secret' => '4b38bb1933886d02182abd08ceb33d64',
      'cookie' => true
    ));
    
    // set access token
    $facebook->setAccessToken($_GET['fbToken']);
    
    // get user ID
    $user = $facebook->getUser();
   
    if ($user) {
      try {
        // we have a logged in user who's authenticated
        $user_profile = $facebook->api('/me');
        
        # the data to insert  
        $data = array( 
            'username' => "new user", 
            'package' => intval($_GET['package']),
            'age' => getAge($user_profile['birthday']), 
            'gender' => $user_profile['gender'],
            'email' => $user_profile['email'],
            'fbToken' => $_GET['fbToken'], //alphanumeric
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
                :fbToken,
                :fbUid,
                :fbLocationId,
                :fbLocation
            )");  
            $STH->execute($data);
        } catch (PDOException $e) {
            echo json_encode(array("status"=>"Could not update the database."));
            file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);
            break; 
        }

        if($DB->lastInsertId() > 0) {
            // SUCCESS! Everything is ok, return a json object back to the app
            $data['status'] = 'success';
            echo json_encode($data);
        } else {
            echo json_encode(array("status"=>"Could not update the database."));
            break;
        }
        
      } catch (FacebookApiException $e) {
        echo json_encode(array("status"=>"Facebook error. Could not access your Facebook account details."));
        file_put_contents('InstasodaFBErrors.txt', $e->getMessage(), FILE_APPEND);
        break; 
      }
    } else {
        echo json_encode(array("status"=>"Could not connect to your Facebook account."));
        break;
    }
    
    function getAge( $p_strDate ) {
        list($d,$m,$Y)    = explode("/",$p_strDate);
        return( date("md") < $m.$d ? date("Y")-$Y-1 : date("Y")-$Y );
    }
?>