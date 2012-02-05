/**
 * Load Node modules
 */
var mongoose = require('mongoose');

/**
 * Connect to the database
 */
mongoose.connect('mongodb://localhost/instasoda');


/**
 * User fixtures
 */
var users = [
	{
		'name': 'misspink23',
		'age': '24',
		'photos': 6,
		'about': 'i duno wat 2 say.. if ya wana talk just send a mail.. i dont tink online dating works so im on just 4 a chat..dats all..iv deleted profiles so iv learned just 2 delete ur ass if ya annoy me..plz have a pic up..i duno how 2 put on profile dat u can only talk if u have apic..its not al bout looks but come on ya likke 2 c who ya talkin 2..ya cud be a 65 yr old perve 4 all i know..so ehhh a ny questions feel free 2 ask...:)'
	},
	{
		'name': 'liloldme',
		'age': '34',
		'photos': 5,
		'about': "hi fellow fishies, well i'm an easy goin gal(well i've bein told so anyway)and a very good listener, love sports \nfootball,gaa (as my lil lad plays both)\n i enjoy most things in life, i enjoy a good nite out on the town yahoo, r a lazy nite in on the couch wit a good dvd( no scary movies 4 me lol), i'm a man utd fan 4 my sins i'v 2 lovely kids a boy and a girl and i'd be lost without them, i work in childcare and just love it lol,i'm a kind hearted person and i don't take things 4 granted , i was brought up 2 respect others and not let people walk all over u,\nLaugh ur heart out.....\nDance in the rain!\n\nCherish the moments...\nIgnore the pain!\nLife,Love,learn...\nForgive and forget!\nLife is to short to live wit regret!!!\n\ni'm big into music... i'm lovin kings of leon at the mo and i'm a big big fan of pink i think her music is amazing and she's so talented and like a lot of the Irish artists out ter at the mo bellex1 and the coronas, the script snow patrol and many many more! pablo nutini and bruno mars are also favs of mine at the mo!!!\nI'M NOT A PERFECT GIRL!\nMy hair doesn't always stay in place and i spill things alot!\nI'm pretty clumsy and sometimes i have a broken heart,My friends and i sometimes fight and somedays nothin goes rite!\nbut when i think about it and take a step back,i remember how amazing life really is and tat maybe jus maybe,i like being UNPERFECT!!!"
	},
	
	{
		'name': 'luckysucker',
		'age': '29',
		'photos': 1,
		'about': 'just mail me just mail me !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
	},
	
	{
		'name': 'shelly50617',
		'age': '29',
		'photos': 8,
		'about': "I'm passionate about dance,choreography and musical theatre. Friends and family are very important to me in my life so would like to meet someone who feels the same. Love to be active and really don't like being idle so when i'm not teaching dance i'm at the gym. My hobbies are based around performing arts and shows.Love to dance so give me any type of music and my dance shoes and i'm happy.I run a stage school for children where i choreograph and teach musical theatre so keeps me busy. I do love a night out at the weekend but working in performing arts doesn't always allow for a saturday night off generally it's a show night, so i do also love a chilled night cuddled up with a bottle of wine. I'm a loyal friend, and i think my friends would consider me to be a good listner,independant,comedic but confident, and very honest and well if they dont they'll just never hear the end of it. Anything else you want to know just ask, and i dont do intimate encounters i have RESPECT for myself so if thats what your looking for move along ;-)"
	},
	
	{
		'name': 'SIFFC',
		'age': '25',
		'photos': 3,
		'about': "Looking for a confident, intelligent, caring, fun, attractive man. dont play games, if I like you, you'll know. If you like games, I won't like you.\n\nI'm fun, kind, outgoing and determined. Like most types of music excluding heavy metal.\n\nBig into animals (except cats, why aren't they classed as rodents?) especially horses and love being outdoors.\n\nFriends would say I'm witty, sarcastic, sensitive, caring and a bit head strong.\n\nIf you like what you read/see then get in touch.\n\nOh and being able to spell is a serious turn on, its difficult enough to master one language and text language is not high on my agenda."
	},
	
	{
		'name': 'fingerlickinchicken',
		'age': '26',
		'photos': 8,
		'about': "hmmmm ....what can i say here that will make me look great...erm ...well firstly i like stuff ...good stuff mainly ! im a bit of a music slut really , do a bit of everything , apart from all that poppy commercial stuff ! i have 3 livers ...and i also sometimes lie !ha"
	},
	
	{
		'name': 'BlondieMaevey',
		'age': '29',
		'photos': 3,
		'about': "hey.. new to this so b nice please :) .. outgoing chatty girl love a laugh , very social.. like to keep fit... Looking to meet a nice kind boy for some giggles and fun!!! Work in finance .. not a boring as it sounds like my job im always busy so work days fly by.. when im not working i like to go the gym or a zumba class with the girls.. like going out for few drinkies anda dance at the weekend.. so if u wanna chat drop me a mail!! Cheers.. and happy fishing everyone :-)" 
	},
	
	{
		'name': 'athletic_lil_missy',
		'age': '27',
		'photos': 8,
		'about': "Big into traveling and work hard / play hard attitude to life. \nI love a good challenge\n\nI enjoy playing/watching ALL sports indoor and outdoor:\nSoccer, football, tennis, swimming, F1 racing\n\nI love food; eating in nice restaurants and really enjoy cooking for others.\nLove to laugh and have fun with friends, Drinks in bars with live entertainment\n\nId like an athletic boy that could go jogging/workout with me in the morning and then have enough energy to go drinking/dancing/have fun that night :)"
	},
	
	{
		'name': 'ros1982',
		'age': '29',
		'photos': 6,
		'about': "relaxed animal lover, like trying lots of new things, like most sports, love rugby, enjoy just taking off on the spur of the moment and ending up somewhere I've never been before. Love both nights in and out, enjoy stand-up comedy, meals out, anything that crops up that sounds like fun. I am a bit of girlie girl but will still attempt to tackle anything life throws at me (except spiders)."
	},
	
	{
		'name': 'elaine2b',
		'age': '26',
		'photos': 2,
		'about': "Well I thought I would give this a go. I'm Elaine and I'm 26. I live in Dublin and I'm a makeup artist. I love going to the cinema, like most types of music and dancing my butt off when I'm not working."
	}
]

/**
 * Create schemas and insert fixtures
 */

// create schema
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;
  
var UsersSchema = new Schema({
		userID	 :  ObjectId
  , name 		 :  { type: String }
  , country  :  { type: String, default: 'Ireland' }
  , city		 :  { type: String, default: 'Dublin' }
  , age  		 :  { type: Number, min: 18 }
  , photos	 :  { type: Number }
  , about		 :  { type: String }
});
  
// create model
var User = mongoose.model('User', UsersSchema);

// remove old fixture data
var Query = User.remove('');
Query.exec();

// insert new fixture data
for(var n=0; n<10; n++) {
	var user = new User(
		{ 
			name	: users[n].name,
			age		: users[n].age,
			photos: users[n].photos,
			about	: users[n].about
		}
	);
	
	user.save();
}
