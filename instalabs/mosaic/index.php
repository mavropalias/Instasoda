<?php
	require('lib/config.php');
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
    <title>Instasoda - fizzy not fussy!</title>

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

		<!-- STYLESHEET -->
		<link rel="stylesheet" type="text/css" href="style.css" />

		<!-- SCRIPTS -->
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>
		<script type="text/javascript" src="js/libs/underscore.js"></script>
		<script type="text/javascript" src="js/libs/backbone-min.js"></script>
		<script type="text/javascript" src="js/libs/mustache.js"></script>
    <!--<script type="text/javascript" src="js/jquery.isotope.min.js"></script>-->
		<script type="text/javascript" src="js/jquery.rte.js"></script>
		<script type="text/javascript" src="js/instasoda.js"></script>

	</head>
	<body>

	<div id="fb-root"></div>
	<script>(function(d, s, id) {
	  var js, fjs = d.getElementsByTagName(s)[0];
	  if (d.getElementById(id)) {return;}
	  js = d.createElement(s); js.id = id;
	  js.src = "//connect.facebook.net/en_GB/all.js#xfbml=1&appId=159444727449256";
	  fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));</script>

	<header>
		<article>
			<h1>share your adventures in dating :-)</h1>
			<p>Share your funniest, most interesting ... or embarassing dating moments.<br>
				It could be you, the person you were with, or anybody else.
			</p>
			<aside>
				<span class="shareFB"><iframe src="//www.facebook.com/plugins/like.php?href=www.facebook.com/apps/application.php?id=159444727449256&amp;send=false&amp;layout=button_count&amp;width=80&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=21&amp;appId=199032880141933" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:80px; height:21px;" allowTransparency="true"></iframe></span>
	      <span class="shareTW"><iframe allowtransparency="true" frameborder="0" scrolling="no" src="//platform.twitter.com/widgets/tweet_button.html?url=http://www.instasoda.com/&text=Instasoda, refreshing dating!" style="width:130px; height:20px;"></iframe></span>
	      <span class="shareGP"><g:plusone size="medium" href="http://www.instasoda.com"></g:plusone></span>
			</aside>
		</article>
		<nav>
			<ul>
				<li>what is instasoda?</li>
				<li>what is this page?</li>
				<li>contact us</li>
			</ul>
		</nav>
	</header>

	<section id="container">

	</section>

	<article id="articleFullView" class="item">

	</article>

	<span id="curtain"></span>

  <script id="tplStories" type="text/template">
      <article class="item">
        <h1><a>{{title}}</a></h1>
        <cite>{{date}} by {{author}}</cite>
        <span>
          <p>{{content}}</p>
        </span>
        <footer></footer>
      </article>
  </script>

  <script id="tplFullStory" type="text/template">
		<h1>{{title}}</h1>
		<cite>{{date}} by {{author}}</cite>
		<span>
			<p>{{content}}</p>
		</span>
		<footer></footer>
  </script>

  <script type="text/javascript">
    (function() {
      var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
      po.src = 'https://apis.google.com/js/plusone.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();
  </script>

	</body>
</html>
