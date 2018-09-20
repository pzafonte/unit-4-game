$(document).ready(function () {

  //Create Characters
  var characters = {
    "luke": {
      name: "Luke Skywalker",
      healthPoints: 100,
      attackPower: 14,
      counterAttackPower: 5
    },
    "obiwan": {
      name: "Obi-Wan Kenobi",
      healthPoints: 120,
      attackPower: 8,
      counterAttackPower: 15
    },
    "d_sidious": {
      name: "Darth Sidious",
      healthPoints: 150,
      attackPower: 8,
      counterAttackPower: 20
    },
    "d_maul": {
      name: "Darth Maul",
      healthPoints: 180,
      attackPower: 7,
      counterAttackPower: 25
    }
  }

  var humanPlayer;
  var availableOpponents = [];
  var activeOpponent;
  var attackCounter = 1;
  var kills = 0;
  var totalCharacters = 0;

  var selectPlayerAudio = new Audio('./assets/audio/select.wav');
  var attackPlayerAudio = new Audio('./assets/audio/attack.wav')

  //Get total number of characters
  for (var key in characters) {
    if (key) {
      totalCharacters++;
    }
  }

  //Draw a Character
  function drawCharacter(character, htmlTag, position) {
    var divHTML;

    if (character.name === "Luke Skywalker") {
      divHTML = $("<div class='character' id='luke'>");
    }
    if (character.name === "Obi-Wan Kenobi") {
      divHTML = $("<div class='character' id='obiwan'>");
    }
    if (character.name === "Darth Sidious") {
      divHTML = $("<div class='character' id='d_sidious'>");
    }
    if (character.name === "Darth Maul") {
      divHTML = $("<div class='character' id='d_maul'>");
    }

    var divBoxHTML = $("<div class='box'>");
    var divInfoHTML = $("<div class='character-info'>").html("<p>" + character.name + " | HP: " + character.healthPoints);

    if (position === "waiting-opponent") {
      $(divHTML).addClass("waiting-opponent");
    } else if (position === "active-opponent") {
      activeOpponent = character;
      divBoxHTML = $("<div class=''>");
      $(divBoxHTML).addClass("opponent-box");
      $(divHTML).addClass("active-opponent");
    }

    divHTML.append(divBoxHTML).append(divInfoHTML);
    $(htmlTag).append(divHTML);


  }

  // Handle Messages
  function printMessage(message) {
    var updateMessage = $("<p>").text(message);
    $("#message").append(updateMessage);

    if (message === "clear") {
      $("#message").text("");
    }
  };

  //Draw characters in a particular section
  function drawCharacters(characterArray, htmlTag) {

    if (htmlTag === "#select-character") {

      $(htmlTag).empty();
      $(htmlTag).html("<h3>Choose your character!</h3>");

      //Draw Each Character
      for (var key in characterArray) {
        if (characterArray.hasOwnProperty(key)) {

          drawCharacter(characterArray[key], htmlTag, "");
        }
      }
    }

    if (htmlTag === "#human-player") {
      $(htmlTag).html("<h3>Your Character</h3>");
      drawCharacter(characterArray, htmlTag, "");
    }

    if (htmlTag === "#select-opponent") {
      $(htmlTag).html("<h3>Select Your Opponent</h3>");

      for (var i = 0; i < characterArray.length; i++) {
        drawCharacter(characterArray[i], htmlTag, "waiting-opponent");
      }

      // Click Event For Each Enemeny
      $(document).on("click", ".waiting-opponent", function () {

        //Clicked opponenet's name
        var name = ($(this).attr("id"));
        // If there is no defender, the clicked enemy will become the defender.
        if ($("#active-opponent").children().length === 0) {

          drawCharacters(name, "#active-opponent");
          selectPlayerAudio.play();
          $(this).hide();
          printMessage("clear");
        }
      });
    }

    //Draw in correct location
    if (htmlTag === "#active-opponent") {
      $(htmlTag).empty();
      $(htmlTag).html("<h3>Your Opponent</h3>");
      for (var i = 0; i < availableOpponents.length; i++) {
        if (availableOpponents[i].name === characters[characterArray].name) {
          drawCharacter(availableOpponents[i], htmlTag, "active-opponent");
        }
      }
    }

    if (htmlTag === "playerDamaged") {
      $("#active-opponent").empty();
      $("#active-opponent").html("<h3>Your Opponent</h3>");
      drawCharacter(characterArray, "#active-opponent", "active-opponent");
    }

    if (htmlTag === "opponentDamaged") {
      $("#human-player").empty();
      $("#human-player").html("<h3>Your Character</h3>");

      drawCharacter(characterArray, "#human-player", "");
    }

    if (htmlTag === "opponentDefeated") {
      $("#active-opponent").empty();
      var opponentDefeatedMessage = "You have defeated " + characterArray.name + ", you can choose to fight another enemy.";
      printMessage(opponentDefeatedMessage);
    }
  };

  function reset(message) {

    var restartButton = $("<button>Restart</button>").click(function () {
      location.reload();
    });

    var endGameMessage = $("<div>").text(message);

    $("#message").append(endGameMessage);
    $("#message").append(restartButton);
  };

  //Draw character function
  drawCharacters(characters, "#select-character");

  $(document).on("click", ".character", function () {

    var name = $(this).attr("id");

    if (!humanPlayer) {

      humanPlayer = characters[name];
      selectPlayerAudio.play();

      for (var key in characters) {
        if (key !== name) {
          availableOpponents.push(characters[key]);
        }
      }

      $("#select-character").hide();
      drawCharacters(humanPlayer, "#human-player");
      drawCharacters(availableOpponents, "#select-opponent");
    }
  });

  $("#active-opponent").on("click", function () {

    if ($("#active-opponent").children().length !== 0) {

      var playerAttackMessage = "You attacked " + activeOpponent.name + " for " + (humanPlayer.attackPower * attackCounter) + " damage.";
      var opponentAttackMessage = activeOpponent.name + " attacked you back for " + activeOpponent.counterAttackPower + " damage.";
      printMessage("clear");

      activeOpponent.healthPoints -= (humanPlayer.attackPower * attackCounter);

      if (activeOpponent.healthPoints > 0) {

        attackPlayerAudio.play();

        drawCharacters(activeOpponent, "playerDamaged");

        printMessage(playerAttackMessage);
        printMessage(opponentAttackMessage);

        humanPlayer.healthPoints -= activeOpponent.counterAttackPower;

        drawCharacters(humanPlayer, "opponentDamaged");

        if (humanPlayer.healthPoints <= 0) {
          printMessage("clear");
          reset("You have been defeated... Game Over!!!");
          $("#active-opponent").unbind("click");
        }
      }
      if (activeOpponent.healthPoints < 0) {
        drawCharacters(activeOpponent, "opponentDefeated");
        kills++;
        if (kills >= (totalCharacters - 1)) {
          printMessage("clear");
          reset("You Won!!! Game Over!!!");
        }
      }

      attackCounter++;

    } else {
      printMessage("clear");
      printMessage("No enemy here.");
    }
  });

});