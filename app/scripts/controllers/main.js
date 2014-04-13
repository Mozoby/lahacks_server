'use strict';

angular.module('socialGameApp')
  .controller('MainCtrl', function ($scope, $goKey, idservice) {

    window.scope = $scope;
    $scope.data = {};
    $scope.answers = [];
    $scope.clusterCount = 0;

    var url = 'https://goinstant.net/df6160309f0a/my-application';
    var id = idservice.id;
    console.log(id);
    enableGame({});

    var socket = {};
    try {
      socket = io.connect('http://lahacks.cloudapp.net:8080');
    } catch (e) {
      console.log(e);
    }

//    socket.emit('initialize', {id: id} );
//
//    socket.on('update', function (data) {
//      console.log(data);
//    });
//
//    socket.on("finalize", function(data) {
//      console.log("final");
//      meet("");
//    });
//
//    socket.on("question", function(data) {
//      enableGame(data);
//    });

    function answer (value) {
      console.log(value);
//      socket.emit('answer', {answer: value});
    }
    $scope.answer = answer;


    function enableGame(data) {
      console.log(data);
      var data = {question: "Best Music?", answers:['Katy Perry','Eminem','Linkin Park','Blake Shelton']};
      data = {question:"Best Movie?",answers:['Inception','300','Boondock Saints','The Hunger Games'],suggestions:['The Shawshank Redemption','The Godfather','The Godfather: Part II','The Dark Knight','Pulp Fiction','The Good, the Bad and the Ugly','Schindler\'s List','12 Angry Men','The Lord of the Rings: The Return of the King','Fight Club','The Lord of the Rings: The Fellowship of the Ring','Star Wars: Episode V - The Empire Strikes Back','Inception','Forrest Gump','One Flew Over the Cuckoo\'s Nest','Goodfellas','The Lord of the Rings: The Two Towers','Star Wars','The Matrix','Seven Samurai','City of God','Se7en','The Usual Suspects','The Silence of the Lambs','Once Upon a Time in the West','It\'s a Wonderful Life','Léon: The Professional','Casablanca','Life Is Beautiful','Raiders of the Lost Ark','Rear Window','Psycho','American History X','City Lights','Saving Private Ryan','Spirited Away','The Intouchables','Memento','Terminator 2: Judgment Day','Modern Times','Sunset Blvd.','Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb','Apocalypse Now','The Pianist','The Green Mile','The Departed','Gladiator','Back to the Future','The Dark Knight Rises','Alien','Django Unchained','The Lives of Others','The Prestige','The Great Dictator','The Shining','Cinema Paradiso','Paths of Glory','American Beauty','The Lion King','WALL·E','North by Northwest','Amélie','Citizen Kane','Aliens','Toy Story 3','Vertigo','M','Das Boot','Taxi Driver','A Clockwork Orange','Double Indemnity','Oldeuboi','To Kill a Mockingbird','Princess Mononoke','Reservoir Dogs','Requiem for a Dream','Once Upon a Time in America','Star Wars: Episode VI - Return of the Jedi','Braveheart','Lawrence of Arabia','Grave of the Fireflies','Eternal Sunshine of the Spotless Mind','Witness for the Prosecution','Full Metal Jacket','Singin\' in the Rain','The Sting','Bicycle Thieves','Monty Python and the Holy Grail','Amadeus','All About Eve','Rashomon','Snatch.','The Treasure of the Sierra Madre','The Wolf of Wall Street','L.A. Confidential','The Apartment','Some Like It Hot','The Third Man','For a Few Dollars More','Jodaeiye Nader az Simin','Indiana Jones and the Last Crusade','Inglourious Basterds','Yojimbo','Batman Begins','The Kid','2001: A Space Odyssey','Unforgiven','Metropolis','Raging Bull','Chinatown','Toy Story','Scarface','Up','Die Hard','Downfall','Mr. Smith Goes to Washington','The Great Escape','El laberinto del fauno','On the Waterfront','Taare Zameen Par','The Bridge on the River Kwai','Heat','Jagten','The Seventh Seal','3 Idiots','Wild Strawberries','The Elephant Man','Ikiru','The General','Ran','My Neighbor Totoro','The Gold Rush','Blade Runner','Lock, Stock and Two Smoking Barrels','12 Years a Slave','Gran Torino','Good Will Hunting','The Grand Budapest Hotel','Rebecca','The Big Lebowski','The Secret in Their Eyes','It Happened One Night','Rush','Rang De Basanti','Warrior','Casino','V for Vendetta','Cool Hand Luke','The Deer Hunter','Her','The Maltese Falcon','Fargo','Gone with the Wind','Trainspotting','Into the Wild','Howl\'s Moving Castle','How to Train Your Dragon','Hotel Rwanda','Judgment at Nuremberg','The Sixth Sense','Butch Cassidy and the Sundance Kid','The Thing','Dial M for Murder','Annie Hall','A Beautiful Mind','Platoon','Kill Bill: Vol. 1','No Country for Old Men','Sin City','Touch of Evil','Mary and Max','Finding Nemo','Diabolique','Life of Brian','Network','The Princess Bride','Amores Perros','The Wizard of Oz','Stand by Me','The Avengers','Captain America: The Winter Soldier','The Grapes of Wrath','Ben-Hur','The Best Years of Our Lives','Incendies','There Will Be Blood','The Lego Movie','Million Dollar Baby','The 400 Blows','Hachi: A Dog\'s Tale','8½','Donnie Darko','Strangers on a Train','The Bourne Ultimatum','In the Name of the Father','High Noon','Gandhi','Persona','Notorious','Gravity','The King\'s Speech','Infernal Affairs','Jaws','Nausicaä of the Valley of the Wind','Lagaan: Once Upon a Time in India','Twelve Monkeys','Fanny and Alexander','La Strada','The Terminator','The Night of the Hunter','Yip Man','Stalker','Who\'s Afraid of Virginia Woolf?','Groundhog Day','The Big Sleep','Dog Day Afternoon','Rocky','Harry Potter and the Deathly Hallows: Part 2','The Battle of Algiers','La Haine','Barry Lyndon','Pirates of the Caribbean: The Curse of the Black Pearl','Before Sunrise','Shutter Island','The Graduate','Swades','The Celebration','Monsters, Inc.','The Hustler','Castle in the Sky','A Christmas Story','Roman Holiday','Underground','Memories of Murder','Stalag 17','In the Mood for Love','Per un pugno di dollari','The Help','Slumdog Millionaire','The Killing','The Hobbit: The Desolation of Smaug','Elite Squad: The Enemy Within','Rope','Black Swan','The Truman Show','Three Colors: Red','Beauty and the Beast','The Diving Bell and the Butterfly','La Dolce Vita','Jurassic Park']};
      $scope.question = data.question;
      $scope.answers = data.answers;

      var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
          var matches, substrRegex;

          // an array that will be populated with substring matches
          matches = [];

          // regex used to determine if a string contains the substring `q`
          substrRegex = new RegExp(q, 'i');

          // iterate through the pool of strings and for any string that
          // contains the substring `q`, add it to the `matches` array
          $.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
              // the typeahead jQuery plugin expects suggestions to a
              // JavaScript object, refer to typeahead docs for more info
              matches.push({ value: str });
            }
          });

          cb(matches);
        };
      };

      var suggestion = data.suggestion || [];
//        $('#additionalAnswer .typeahead').typeahead({
//            hint: true,
//            highlight: true,
//            minLength: 1
//          },
//          {
////          name: 'states',
////          displayKey: 'value',
//            source: substringMatcher(suggestion)
//          });

      $scope.disableAnswer = false;
      var startTime = new Date().getTime();
      var votingTime = 100;
      $scope.countDown = votingTime;
      var intervalId = setInterval(function() {
        $scope.$apply(function() {
          $scope.countDown -= 1;
          var time = new Date().getTime();
          if ( (time - startTime) > (votingTime * 1000) ) {
            $scope.disableAnswer = true;
            clearInterval(intervalId);
            return;
          }
        });
      }, 1000);
    }

    function disableGame() {
      $scope.disableAnswer = true;
    }

    function meet (id) {
      location.href = "#/chat/" + id;
    }

  });
