<?php

    try {
        //connect to database
        $host = "external-db.s56768.gridserver.com";
        $port = 3306;
        $username = "db56768_is";
        $password = "mav711ZX#$4*";
        $database = "db56768_is";
        
        $dsn = "mysql:host=$host;port=$port;dbname=$database";
        $DB = new PDO($dsn, $username, $password);
        
        // PDO Settings
        $DB->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION ); // throw exceptions
    } catch(PDOException $e) {
        header( 'HTTP/1.1 400: BAD REQUEST' );
        echo json_encode(array("status"=>"Error 100")); 
        file_put_contents('InstasodaPDOErrors.txt', $e->getMessage(), FILE_APPEND);  
    }
    
    session_start();
    
    require 'api/libs/facebook.php';
    require 'api/libs/instasodaHelperFunctions.php';    
    
    // variables
    $showForm = false;
    $complete = false;
    
    $debug = "1";
    // detect user status
    if($_COOKIE['token'] != "" && $_COOKIE['registered'] != "true"){
        $debug = "2";
                
        if($_COOKIE['ready'] == "true") {
            $debug = "3";
            
            // add user to the DB
            $fbToken = $_COOKIE['token'];
            $package = "3";
            
            $item = new stdClass(); 
            $item->username = $_COOKIE['username'];
            $item->interestedInMen = $_COOKIE['interestedInMen'];
            $item->interestedInWomen = $_COOKIE['interestedInWomen'];
            
            /*            $item->interestedInMen = false;
                if($_COOKIE['interestedInMen'] == "true") $item->interestedInMen = true;
            $item->interestedInWomen = false;
                if($_COOKIE['interestedInWomen'] == "true") $item->interestedInWomen = true;*/
            
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
                        'interestedInMen' => ($row->interestedInMen == "true" ? true : false),
                        'interestedInWomen' => ($row->interestedInWomen == "true" ? true : false),
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
                            'username' => $item->username, 
                            'package' => $package,
                            'age' => getAge($user_profile['birthday']), 
                            'gender' => $user_profile['gender'],
                            'email' => $user_profile['email'],
                            'aboutMe' => $item->aboutMe,
                            'interestedInMen' => ($item->interestedInMen == "true" ? true : false),
                            'interestedInWomen' => ($item->interestedInWomen == "true" ? true : false),
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
                            $img = imagecreatefromjpeg('https://graph.facebook.com/'.$fbUid.'/picture?type=large&access_token='.$fbToken);
                            $path = $fqlResult[0]->third_party_id.'_'.rand(1, 10000).'_'.rand(1, 10000).'.jpg';
                            $file = dirname(__file__).'/api/photos/'.$path;
                            imagefilter($img, IMG_FILTER_PIXELATE, 8);
                            imagejpeg($img, $file);
                            
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
                        //header('HTTP/1.1 200 OK');
                        //$data['status'] = 'success';
                        //$data['likes'] = $fbLikesResult;
                        //echo json_encode($data);
                        setcookie("registered", "true");
                        $complete = true;
                
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
        } else {
            $debug = "4";
            $showForm = true;
        }
                
    } else if ($_COOKIE['token'] != "" && $_COOKIE['registered'] == "true"){
        $complete = true;
    }
    

?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://www.facebook.com/2008/fbml" lang="en">
    <head>
        <!-- Scripts for IE7/8 -->
        <!--[if lt IE 9]>
          <script src="http://ie7-js.googlecode.com/svn/version/2.1(beta4)/IE9.js" type="text/javascript"></script>
          <script src="http://ie7-js.googlecode.com/svn/version/2.1(beta4)/ie7-squish.js" type="text/javascript"></script>
          <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
        
        <!-- TITLE -->
        <title>InstaSoda - Join closed beta</title>
        
        <!-- OPEN GRAPH -->
        <meta property="og:title" content="Instasoda" />
        <meta property="og:type" content="blog" />
        <meta property="og:url" content="http://instasoda.com" />
        <meta property="og:image" content="" />
        <meta property="og:site_name" content="Instasoda" />
        <meta property="fb:admins" content="659710874" />
        
        <!-- MISC TAGS -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <link rel="shortcut icon" href="/favicon.ico">
        
        <!-- SCRIPTS -->
        <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>
        
        <style>
            /* RESET STYLES */        
            html, body, div, span, applet, object, iframe,
            h1, h2, h3, h4, h5, h6, p, blockquote, pre,
            a, abbr, acronym, address, big, cite, code,
            del, dfn, em, img, ins, kbd, q, s, samp,
            small, strike, strong, sub, sup, tt, var,
            b, u, i, center,
            dl, dt, dd, ol, ul, li,
            fieldset, form, label, legend,
            table, caption, tbody, tfoot, thead, tr, th, td,
            article, aside, canvas, details, embed, 
            figure, figcaption, footer, header, hgroup, 
            menu, nav, output, ruby, section, summary,
            time, mark, audio, video {
                margin: 0;
                padding: 0;
                border: 0;
                vertical-align: baseline;
                outline:none;
            }
            /* HTML5 display-role reset for older browsers */
            article, aside, details, figcaption, figure, 
            footer, header, hgroup, menu, nav, section {
                display: block;
            }
            body {
                line-height: 1;
            }
            ol, ul {
                list-style: none;
            }
            blockquote, q {
                quotes: none;
            }
            blockquote:before, blockquote:after,
            q:before, q:after {
                content: '';
                content: none;
            }
            table {
                border-collapse: collapse;
                border-spacing: 0;
            }
                      
                          
            /* INSTASODA STYLES */    
            html{
                height:100%;
            }          
            body{
                background:#DEF2F9;
                background: -o-linear-gradient(bottom, #DEF2F9 0%, #EFF8FA 100%);
                background: -moz-linear-gradient(bottom, #DEF2F9 0%, #EFF8FA 100%);
                background: -webkit-linear-gradient(bottom, #DEF2F9 0%, #EFF8FA 100%);
                background: -ms-linear-gradient(bottom, #DEF2F9 0%, #EFF8FA 100%);
                background: linear-gradient(bottom, #DEF2F9 0%, #EFF8FA 100%);

                font-family: sans-serif;
                font-size:62.5%;
                height:100%;
            }
            
            #instasodaLogo{
                background:url(images/instasoda_logo.png) top left no-repeat;
                width:373px;
                height:186px;
                position:absolute;
                top:0;
                left:0;                
            }
            
            #instasodaFaces{
                background:url(images/instasoda_faces.png) top left no-repeat;
                width:156px;
                height:517px;
                position:fixed;
                top:50px;
                right:0;   
            }
            
            #closedBeta{
                position:absolute;
                top:150px;
                left:270px;
                max-width:650px;                
            }
            
            h1{
                font-size:4em;
                line-height:2em;
                font-weight:bold;
                color:#2679A1;
            }
            
            p{
                color:#00364D;
                font-size:1.8em;
                line-height:1.7em;
            }
            
            .fb-login-button{
                margin-top:1em;
            }
            
            .preferences, .success{
                margin-top:20px;
                font-size:1.7em;
                line-height:1.7em;
                color:#00364D;
            }
                .preferences h2, .success h2{
                    font-size:1.5em;
                    margin-top:1em;
                    color:#2679A1;
                }
                .preferences .tip{
                    
                }
                .preferences #saveProfileButton{
                    background:#00364D;
                    border:5px solid #EFF8FA;
                    color:#EFF8FA;
                    display:block;
                    font-size:1.2em;
                    height:2.5em;
                    margin-top:1em;
                    width:8em;
                    cursor:pointer;
                }
                .preferences #saveProfileButton:hover{
                    text-decoration:underline;
                }
                .preferences #loader{
                    margin-top:1em;
                }
            .contact{
                margin-top:20px;
                font-size:1.3em;
                line-height:1.7em;
                color:#00364D;
                display:block;
            }
        </style>
        
        <script>        
            $(document).ready(function(){
                $('#saveProfileButton').click(function(){
                    $(this).fadeOut();
                    $('#loader').fadeIn();
                    var men = false;
                    var women = false;
                    
                    if($('input[name=interestedInMen]:checked').length > 0) men = true;
                    if($('input[name=interestedInWomen]:checked').length > 0) women = true;

                    document.cookie = "ready" + "=" + "true";
                    document.cookie = "username" + "=" + escape( $('input[name=username]').val() );
                    document.cookie = "interestedInMen" + "=" + men;
                    document.cookie = "interestedInWomen" + "=" + women;
                    
                    window.location.reload();
                })
            });
        </script>
    </head>
    
    <body>
 <html>
    <div id="fb-root"></div>
    <script>
        window.fbAsyncInit = function() {
            FB.init({
                appId      : '159444727449256',
                status     : true, 
                cookie     : true,
                xfbml      : true,
                oauth      : true,
            });          
            FB.Event.subscribe('auth.login', function(response) {
              document.cookie = "token" + "=" + response.authResponse.accessToken;
              $(document).ready(function(){
                $('.fb-login-button').remove();
                $('.preferences').fadeIn();
              });
            });
        };
        (function(d){
           var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
           js = d.createElement('script'); js.id = id; js.async = true;
           js.src = "//connect.facebook.net/en_US/all.js";
           d.getElementsByTagName('head')[0].appendChild(js);
             }(document));
    </script>
      

        <h1 id="instasodaLogo" title="InstaSoda"></h1>
        <aside id="instasodaFaces"></aside>
        
        <section id="closedBeta">
            <h1>Join InstaSoda's closed beta</h1>
            <p >We are in the process of developing a really cool dating app that will be available on most of your devices. By joining the closed beta, you will help us optimise the app in many ways. At this stage, we are only asking you to connect to InstaSoda's Facebook app, choose a nickname and indicate whether you'd be interested to date women and/or men. Thanks!</p>
            
            <?php if(!$complete) { ?>
            <div class="fb-login-button" data-scope="email,user_relationships,user_location,user_hometown,user_birthday,user_activities,user_education_history,read_stream,user_interests,user_likes,user_photos,offline_access">Login with Facebook</div>

            <div class="preferences" style="display:none;">
                <h2>Nickname</h2>
                <span class="tip">This is how other instasoda users will see you as.</span>
                <input name="username" autofocus required maxlength=50>
                
                <h2>I would like to meet</h2>
                <span class="tip">Choose either or both: </span>
                <label><input type="checkbox" name="interestedInWomen" value="true"><strong> women</strong></label>
                <label><input type="checkbox" name="interestedInMen" value="true"><strong> men</strong></label>
                
                <button type="submit" id="saveProfileButton">Save profile</button>
                <div id="loader" style="display:none;"><img src="images/load.gif" width="24" height="24"></div>
            </div>
            <?php } else { ?>
            <div class="success">
                <h2>Success :-)</h2>
                <span class="tip">Thank you for registering! We will let you know as soon as the InstaSoda app becomes available.</span>
            </div>
            <?php } ?>
            
            <span class="contact">&copy; InstaSoda (info@instasoda.com)</span>

        </section>
    </body>
</html>
