<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    
    <link rel="stylesheet" type="text/css" href="css/style.css" />
    
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.min.js"></script>
    <script type="text/javascript" src="scripts/library.js"></script>
    <script type="text/javascript" src="scripts/jquery.afterresize.min.js"></script>
    <script type="text/javascript">                                         
      $(document).ready(function() {
        initBoxes();
      });
      
      $(window).bind("afterresize", function() {
        initBoxes();
      });
    </script>    
    <title>jquery test</title>
  </head>
  <body>
    <div id="instasoda">
      <img src="images/logo.png" id="instasoda_logo" />
      <!-- <span id="register">Click to create your full profile instantly!</span> -->
    </div>
      
      
    <div id="boxes"></div>
    <div id="log"></div>
    <div id="tooltip">
      <div id="tipContent">
        <span class="name">Alex</span>
        <span class="details">27, 1.84cm, Dublin</span>
        <span class="desc">likes travelling, soccer, video games and movies</span>
      </div>
    </div>
  </body>
</html>
