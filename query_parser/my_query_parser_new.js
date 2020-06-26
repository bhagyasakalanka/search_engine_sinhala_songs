const artist_charactor = "s";

function query_parser(text) {
  var text = text.toLowerCase();
  var must_query = [];
  var should_query = [];
  var must_not_query = {};
  var range_query = {};
  var top_query = {};
  var phase_query = [];
  const wordList = text.split(` `);

  var i = 0;
  var andWords = [];
  while (i < wordList.length) {
    if (wordList[i] === "and") {
      //handle previous word
      var previousWord = wordList[i - 1];
      andWords.push(previousWord);
      andWords.push(wordList[i]);
      if (previousWord[previousWord.length - 1] === '"') {
        var [phase, andList] = findPhaseBackword(i - 1);
        must_query.push({ _all: [phase, "match_phase"] });
        andWords = andWords.concat(andList);
      } else if (previousWord[previousWord.length - 1] === artist_charactor) {
        must_query.push({
          artist: [previousWord.substring(0, previousWord.length - 1), "term"],
        });
      } else {
        must_query.push({ _all: [previousWord, "term"] });
      }
      //handle next word
      var nextWord = wordList[i + 1];
      andWords.push(nextWord);
      if (nextWord[0] === '"') {
        var [phase, andList] = findPhaseForword(i + 1);
        must_query.push({ _all: [phase, "match_phase"] });
        andWords = andWords.concat(andList);
        i += andList.length + 1;
      } else if (nextWord[nextWord.length - 1] === artist_charactor) {
        must_query.push({
          artist: [nextWord.substring(0, nextWord.length - 1), "term"],
        });
        i++;
      } else {
        must_query.push({ _all: [nextWord, "term"] });
        i++;
      }
    }
    i++;
  }

  andWords.forEach((element) => {
    if (wordList.includes(element)) {
      var index = wordList.indexOf(element);
      wordList.splice(index, 1);
    }
  });
  console.log(wordList);
  i = 0;
  while (i < wordList.length) {
    var currentWord = wordList[i];
    if (currentWord[0] === '"') {
      var [phase, andList] = findPhaseForword(i);
      should_query.push({ _all: [phase, "match_phase"] });
      i += andList.length + 1;
    } else if (currentWord[currentWord.length - 1] === artist_charactor) {
      should_query.push({
        artist: [currentWord.substring(0, currentWord.length - 1), "term"],
      });
      i++;
    } else {
      should_query.push({ _all: [currentWord, "term"] });
      i++;
    }
  }

  function findPhaseBackword(index) {
    var phase = " " + wordList[index].substring(0, wordList[index].length);
    var andList = [];
    var x = index - 1;
    while (x >= 0) {
      var neWord = wordList[x];
      andList.push(neWord);
      if (neWord[0] === '"') {
        phase = neWord.substring(1, neWord.length) + phase;

        break;
      } else {
        phase = " " + neWord + phase;
      }
      x--;
    }
    return [phase, andList];
  }

  function findPhaseForword(index) {
    var phase = wordList[index].substring(1, wordList[index].length) + " ";
    var andList = [];
    var x = index + 1;
    while (x < wordList.length) {
      var neWord = wordList[x];
      andList.push(neWord);
      if (neWord[neWord.length - 1] === '"') {
        phase = phase + neWord.substring(0, neWord.length - 1);
        break;
      } else {
        phase = phase + neWord + " ";
      }
      x++;
    }
    return [phase, andList];
  }

  console.log(must_query);
  console.log(should_query);
}

var sample_text = '1s 2 "3s df" and 4 gf "5s gh" and "6s ff" "fdf dsdsd" jjk';
query_parser(sample_text);
