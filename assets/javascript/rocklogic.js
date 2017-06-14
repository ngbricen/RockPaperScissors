// Initialize Firebase
  var config = {
    apiKey: "AIzaSyDBqSlcTLnAjPN2HO0EtQIZaVGMZf-N8WI",
    authDomain: "rock-paper-scissors-24bb5.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-24bb5.firebaseio.com",
    projectId: "rock-paper-scissors-24bb5",
    storageBucket: "rock-paper-scissors-24bb5.appspot.com",
    messagingSenderId: "4189549853"
  };

  firebase.initializeApp(config);

// create firebase database variable 
var database = firebase.database();

// variables 
var userName;
var userNumber = "";
var user1Name = "";
var user1Win = 0;
var user1Loss = 0;
var user1Draw = 0;
var user2Name = "";
var user2Win = 0;
var user2Loss = 0;
var user2Draw = 0;
var turnCount = 0;
var user1choice = "";
var user2choice = "";


$("#userNameMessage").hide();
$("#turnNameMessage").hide();

// At the initial load and subsequent value changes, get a snapshot of the local data.
// This function allows you to update your page in real-time when the firebase database changes.
database.ref().on("value", function(snapshot) {

  	// If Firebase has a player stored (first player)
	if (snapshot.child("players/1").exists() ) {
		user1Name = snapshot.val().players[1].name;
		user1Choice = snapshot.val().players[1].choice;
		user1Win = snapshot.val().players[1].wins;
		user1Loss = snapshot.val().players[1].losses;
		user1Draw = snapshot.val().players[1].draws;

		$("#user1Title").text(user1Name);
		$("#user1Score").text("Wins: " + user1Win + " Losses: " + user1Loss + " Draws: " + user1Draw);
	}
	else {
		$("#user1Title").text("Waiting For Player 1");  	
	}

	if (snapshot.child("turn").exists() ) {
		turnCount = snapshot.val().turn;
		sessionStorage.setItem("turnCount", turnCount);
	}

	if (snapshot.child("players/2").exists() ) {
		user2Name = snapshot.val().players[2].name;
		user2Choice = snapshot.val().players[2].choice;
		user2Win = snapshot.val().players[2].wins;
		user2Loss = snapshot.val().players[2].losses;
		user2Draw = snapshot.val().players[2].draws;

		$("#user2Title").text(user2Name);

		$("#turnNameMessage").show();
		$("#turnNameMessage").text("Waiting for " + user1Name + " to choose!");
		
		$("#user2Score").text("Wins: " + user2Win + " Losses: " + user2Loss + " Draws: " + user2Draw);
		
		if (sessionStorage.getItem("currentUserName") === user1Name){		
			if (turnCount === 1){
				$("#turnNameMessage").text("It's Your Turn!");
				$("#user1Options").empty();
				$("#user1Options").append($("<h3><span class='user1choices'>Rock</span></h3>"));
				$("#user1Options").append($("<h3><span class='user1choices'>Paper</span></h3>"));
				$("#user1Options").append($("<h3><span class='user1choices'>Scissors</span></h3>"));			
			}
			else{
				$("#turnNameMessage").text("Waiting for " + user2Name + " to choose!");		
			}
		}

		if (sessionStorage.getItem("currentUserName") !== user1Name && turnCount === 2){
			$("#turnNameMessage").text("It's Your Turn!");

			$("#user2Options").append($("<h3><span class='user2choices'>Rock</span></h3>"));
			$("#user2Options").append($("<h3><span class='user2choices'>Paper</span></h3>"));
			$("#user2Options").append($("<h3><span class='user2choices'>Scissors</span></h3>"));			
		}
	
  	}
  	else {

  		$("#user2Title").text("Waiting For Player 2");
  	}

	if (snapshot.child("players/1/choice").exists() && snapshot.child("players/2/choice").exists() && turnCount === 3){
		displayResults(user1Choice,user2Choice,user1Win,user1Loss,user1Draw, user2Win, user2Loss, user2Draw);
	}

  // If any errors are experienced, log them to console.
}, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
});


$("#submitName").on("click",function(event){
	event.preventDefault();

	//Grab User Input
	userName = $("#userName").val().trim();

	// Clear sessionStorage
    sessionStorage.clear();

    // Store all content into sessionStorage
    sessionStorage.setItem("currentUserName", userName);


	//Upload User Data to Database only if there the user names have not be stored yet
	//Only do so if there's actually data that was entered
	if (userName !== "" && ( user1Name === "" || user2Name ==="" ) ){

		//Determine if it is the 1st or the 2nd user playing
		if (user1Name === ""){
			userNumber = 1;
			user1Name = userName;
		}

		else{
			userNumber = 2
			user2Name = userName;
		}

		//Set the user
		database.ref("players" + "/" + userNumber).set({
			name:userName,
			wins: 0,
			losses: 0,
			draws: 0
		});

		//Display Message;
		$("#userNameMessage").text("Hi " + userName + "! You are player " + userNumber);
		
		//Display the message and hide the Name entry Section
		$("#userNameMessage").show();
		$("#userNameSection").hide();
		
		if (userNumber === 2){
			updateCount();
		}
	}

	//Clear the textbox
	$("#userName").text("");

});


function updateCount(){
	
	turnCount++;

 	//Set the turn
	database.ref().update({
		turn:turnCount
	});

}

$(document).on("click",".user1choices",function(){
	$("#user1Options").empty();
	$("#user1Options").append($("<h2>"+ $(this).text() +"</h2>"));

  	user1choice = $(this).text();
  	
	turnCount = sessionStorage.getItem("turnCount");

	turnCount++;

	database.ref().update({
		turn:turnCount,
		"players/1/choice":user1choice
	});
});

$(document).on("click",".user2choices",function(){
	$("#user2Options").empty();
	$("#user2Options").append($("<h2>"+ $(this).text() +"</h2>"));

	user2choice = $(this).text();

	turnCount = sessionStorage.getItem("turnCount");

	turnCount++;

	database.ref().update({
		turn:turnCount,
		"players/2/choice":user2choice
	});
});

function displayResults(a,b,w1,l1,d1,w2,l2,d2){
		$("#turnNameMessage").hide();

		$("#user1Options").empty();
		$("#user2Options").empty();

		$("#user1Options").append($("<h2>"+ a +"</h2>"));
		$("#user2Options").append($("<h2>"+ b +"</h2>"));

	if (a === b){
  			d1++;
  			d2++;
  			$("#results").append("<h1> THIS IS A DRAW </h1>");
	}
	else{
		if ((a === "Rock" && b === "Scissors") || (a === "Scissors" && b === "Paper") || (a === "Paper" && b === "Rock")  ){
			w1++;
			l2++;
			$("#results").append("<h1>" + user1Name + " Wins </h1>");
		}
		else {
			l1++;
			w2++;
			$("#results").append("<h1>" + user2Name + " Wins </h1>");	
		}
	}

	database.ref().update({
		"players/1/wins": w1,
		"players/1/losses": l1,
		"players/1/draws": d1,
		"players/2/wins": w2,
		"players/2/losses": l2,
		"players/2/draws": d2,
		turn: 1
	});
		
	$("#user1Score").text("Wins: " + w1 + " Losses: " + l1 + " Draws: " + d1);
	$("#user2Score").text("Wins: " + w2 + " Losses: " + l2 + " Draws: " + d2);

	setTimeout(function() { 
		$("#results").empty();
		$("#user1Options").empty();
		$("#user2Options").empty();

		//Re-Display User 1 Options
	if (sessionStorage.getItem("currentUserName") === user1Name){		
		$("#user1Options").append($("<h3><span class='user1choices'>Rock</span></h3>"));
		$("#user1Options").append($("<h3><span class='user1choices'>Paper</span></h3>"));
		$("#user1Options").append($("<h3><span class='user1choices'>Scissors</span></h3>"));			
	}
	}, 3000);
	

}

function fadeOutResults() {
}