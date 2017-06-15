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
var userMessage = "";
var userNode = "";
var disconnectMessage = "";
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

	//Hide Messages about turns if both players names have not yet been recorded
	if (snapshot.child("turn").exists() && snapshot.val().turn === 0 ) {
		$("#turnNameMessage").empty();
	}
	else
	{
	  	// If Firebase has a player stored (first player) get the players values
	  	// whether or not they were already entered
		if (snapshot.child("players/1").exists() ) {
			user1Name = snapshot.val().players[1].name;
			user1Choice = snapshot.val().players[1].choice;
			user1Win = snapshot.val().players[1].wins;
			user1Loss = snapshot.val().players[1].losses;
			user1Draw = snapshot.val().players[1].draws;

			//Display Player's Name and Score
			$("#user1Title").text(user1Name);
			$("#user1Score").text("Wins: " + user1Win + " Losses: " + user1Loss + " Draws: " + user1Draw);
		}
		else {
			//If No players selected yet, display standard waiting message
			$("#user1Title").text("Waiting For Player 1");  	
		}

		//Need to store the turn value into session to be able to properly
		//flip between 1 player and the other to store proper values
		//and also display right message in the right player's page
		if (snapshot.child("turn").exists() ) {
			turnCount = snapshot.val().turn;
			sessionStorage.setItem("turnCount", turnCount);
		}

	  	// If Firebase has a 2nd player stored get the players values
	  	// whether or not they were already entered
		if (snapshot.child("players/2").exists() ) {
			user2Name = snapshot.val().players[2].name;
			user2Choice = snapshot.val().players[2].choice;
			user2Win = snapshot.val().players[2].wins;
			user2Loss = snapshot.val().players[2].losses;
			user2Draw = snapshot.val().players[2].draws;

			//Display Player's Name and Score and show turn's message
			$("#user2Title").text(user2Name);
			$("#user2Score").text("Wins: " + user2Win + " Losses: " + user2Loss + " Draws: " + user2Draw);

			$("#turnNameMessage").text("Waiting for " + user1Name + " to choose!");
			$("#turnNameMessage").show();
			
			//Need to check the Current user Name value previously stored into session to be able to properly
			//determine which player to add text and game choices to
			//Also only display choice when it is the turn of the user
			if (sessionStorage.getItem("currentUserName") === user1Name){		
				if (turnCount === 1){
					$("#turnNameMessage").text("It's Your Turn!");
					$("#user1Options").empty();

					//Display the Rock/Paper/Scissors Options
					displayGameChoice("#user1Options","user1choices");		
				}
				else{
					$("#turnNameMessage").text("Waiting for " + user2Name + " to choose!");		
				}
			}

			if (sessionStorage.getItem("currentUserName") !== user1Name && turnCount === 2){
				$("#turnNameMessage").text("It's Your Turn!");
				$("#user2Options").empty();

				//Display the Rock/Paper/Scissors Options
				displayGameChoice("#user2Options","user2choices");
			}
		
	  	}
	  	else {
	  		//If Player 2 does not exist display standard message
	  		$("#user2Title").text("Waiting For Player 2");
	  	}

	  	//When both choices are available and both players have played their turn, we need to display results
		if (snapshot.child("players/1/choice").exists() && snapshot.child("players/2/choice").exists() && turnCount === 3){
			displayResults(user1Choice,user2Choice,user1Win,user1Loss,user1Draw, user2Win, user2Loss, user2Draw);
		}

		//Add Messages on all users windows if the chat exists 
		if (snapshot.child("chat").exists()){
			//Empty Text area
			$("#message").text("");
			$("#messageArea").text("");

			userMessage = snapshot.val().chat.message;
			$("#messageArea").append(userMessage + "\n");
		}
	}
  // If any errors are experienced, log them to console.
}, function(errorObject) {
  console.log("The read failed: " + errorObject.code);
});


//Actions when users enter their names into the box to start the game
$("#submitName").on("click",function(event){
	event.preventDefault();

	//Grab User Input
	userName = $("#userName").val().trim();

	// Clear sessionStorage and store current user name to be able to display messages in the right window
    sessionStorage.clear();
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
		$("#userNameMessage").html("<h3> Hi " + userName + "! You are player " + userNumber + "</h3>");
		$("#userNameMessage").attr("user-name",userName);
		$("#userNameMessage").attr("user-id",userNumber);

		//Display the message and hide the Name entry Section
		$("#userNameMessage").show();
		$("#userNameSection").hide();
		
		if (userNumber === 2){
		 	//Set the turn
			database.ref().update({
				turn:1
			});		
		}
	}

	//Clear the textbox
	$("#userName").text("");

});

//Actions when users enters a message
$("#sendMessage").on("click",function(event){
	event.preventDefault();

	//Grab User Input
	userMessage = $("#messageArea").html() + $("#userNameMessage").attr("user-name") + ": " + $("#message").val().trim();

	disconnectMessage = userMessage + "\n" + $("#userNameMessage").attr("user-name") + ": Disconnected from the chat";

	userNode = "players/" + $("#userNameMessage").attr("user-id");

	//Empty Text area
	$("#message").val("");

	//Set the turn
	database.ref("chat").update({
		message:userMessage
	});

	//On Disconnect, remove the node of user disconnecting
	if (userNode === "players/1"){
		database.ref().onDisconnect().update({
		  "players/1" : null,
		  "turn": 1,
		  "chat/message":disconnectMessage
		});
	}
	else
	{
		database.ref().onDisconnect().update({
		  "players/2" : null,
		  "turn": 1,
		  "chat/message":disconnectMessage
		});
	}

});

//Action when user selects one of the choices (Paper, Scissors or Rock)
$(document).on("click",".user1choices",function(){

	//Diplay User's choice
	$("#user1Options").empty();
	$("#user1Options").append($("<h1>"+ $(this).text() +"</h1>"));

  	user1choice = $(this).text();
  	
	//Updating turn to properly identiy first player's turn and also storing in firebase DB
	turnCount = $("#userNameMessage").attr("user-id");
	turnCount++;
	database.ref().update({
		turn:turnCount,
		"players/1/choice":user1choice
	});

});

//Action when user selects one of the choices (Paper, Scissors or Rock)
$(document).on("click",".user2choices",function(){
	//Diplay User's choice
	$("#user2Options").empty();
	$("#user2Options").append($("<h1>"+ $(this).text() +"</h1>"));

	user2choice = $(this).text();

	//Updating turn to properly identiy 2nd player's turn and also storing in firebase DB
	turnCount = $("#userNameMessage").attr("user-id");
	turnCount++;
	database.ref().update({
		turn:turnCount,
		"players/2/choice":user2choice
	});
});

//Display Results when both choices were entered
function displayResults(choice1,choice2,w1,l1,d1,w2,l2,d2){
		//Remove all Existing Messages
		$("#turnNameMessage").empty();
		$("#user1Options").empty();
		$("#user2Options").empty();

		//Display player's choices on both players' windows
		$("#user1Options").append($("<h1>"+ choice1 +"</h1>"));
		$("#user2Options").append($("<h1>"+ choice2 +"</h1>"));

	//Determine who the winner of the Paper/Scissors/Rock game is and display results
	if (choice1 === choice2){
  			d1++;
  			d2++;
  			$("#results").append("<h1> THIS IS A DRAW </h1>");
	}
	else{
		if ((choice1 === "Rock" && choice2 === "Scissors") || (choice1 === "Scissors" && choice2 === "Paper") || (choice1 === "Paper" && choice2 === "Rock")  ){
			w1++;
			l2++;
			$("#results").append("<h1>" + user1Name + " WINS </h1>");
		}
		else {
			l1++;
			w2++;
			$("#results").append("<h1>" + user2Name + " WINS </h1>");	
		}
	}

	//Display the win/loss/draw score of each user
	$("#user1Score").text("Wins: " + w1 + " Losses: " + l1 + " Draws: " + d1);
	$("#user2Score").text("Wins: " + w2 + " Losses: " + l2 + " Draws: " + d2);

	//Store the results into firebase and updating turn back to 0 for the next player
	database.ref().update({
		"players/1/wins": w1,
		"players/1/losses": l1,
		"players/1/draws": d1,
		"players/2/wins": w2,
		"players/2/losses": l2,
		"players/2/draws": d2,
		turn: 0
	});
		

	//Display the results messages for 3 seconds, before clearing out the window and
	//redisplaying options for user 1
	setTimeout(function() { 
		$("#results").empty();
		$("#user1Options").empty();
		$("#user2Options").empty();

		//Re-Display User 1 Options
		if (sessionStorage.getItem("currentUserName") === user1Name){		

			//Display the Rock/Paper/Scissors Options
			displayGameChoice("#user1Options","user1choices");			
		}

		database.ref().update({
			turn: 1
		});		
	}, 3000);
	

}

function displayGameChoice(userDiv, userClass){
	$(userDiv).append($("<h3><span class='" + userClass + "'>Rock</span></h3>"));
	$(userDiv).append($("<h3><span class='" + userClass + "'>Paper</span></h3>"));
	$(userDiv).append($("<h3><span class='" + userClass + "'>Scissors</span></h3>"));
}