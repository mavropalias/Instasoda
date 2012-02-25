$(document).ready(function(){
			
			// arrange the articles into a grid
			$('#container').isotope({
			  masonry : {
			    columnWidth : 322
			  }
			});
			
			// initialise the rich text-area
			$('.rte-zone').rte();
			
			// add click handlers for all articles
			$('.clickable').click(function(){
				$('#curtain').show();
				$('#articleFullView').fadeOut().html($(this).html()).fadeIn(300);
			});
			
			// add close handlers for #articleFullView popup 
			$('#curtain').click(function(){
				closeFullView();
			});
			
			function closeFullView(){
				$('#articleFullView, #curtain').fadeOut(300);
			}
			
			// submit story
			$('#storySubmit').on('click', function(){
        $.ajax({
          type: 'POST',
          url: "lib/submitStory.php",
          data: { 
          	"story": $('iframe#storyContent').contents().find('.frameBody').html(),
          	"nickname": $('.storyNickname').val()
        	},
          dataType: "json",
          success: function(data) {
             if(data.status == "alright"){
               //success
               alert("success");
             }
             else{
               //fail
               alert("fail");
             }
          }
        });
			});
		});