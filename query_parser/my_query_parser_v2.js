const artist_charactor = "ගෙ";
var fs = require("fs");
const numberMap = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};
function query_parser(text) {
  var text = text.toLowerCase();
  var must_query = {
    _all: [],
    artist: [],
    lyrics_by: [],
    music: [],
    duration: [],
    rating: [],
    movie: [],
  };
  var should_query = {
    _all: [],
    artist: [],
    lyrics_by: [],
    music: [],
    duration: [],
    rating: [],
    movie: [],
  };
  var must_not_query = {};
  var range_query = {};
  var top_query = {};
  var phase_query = [];
  var sort_query = [];
  const wordList = [];
  var phase = "";
  var word = "";
  var isphaseStarted = false;
  for (let i = 0; i < text.length; i++) {
    const element = text[i];
    if (element === '"' || isphaseStarted) {
      phase += element;
      if (element === '"') {
        isphaseStarted = !isphaseStarted;
        if (isphaseStarted === false) {
          wordList.push(phase.trim());
          phase = "";
        }
      }
    } else {
      word += element;

      if (element === " ") {
        if (word.trim() !== "") {
          wordList.push(word.trim());
        }
        word = "";
      }
    }
  }

  var i = 0;
  var andWords = [];

  while (i < wordList.length) {
    if (wordList[i] === "සහ") {
      //handle previous word
      var previousWord = wordList[i - 1];
      andWords.push(previousWord);
      andWords.push(wordList[i]);
      if (previousWord[0] === '"') {
        must_query._all.push([previousWord, "multi_match_phrase"]);

        andWords = andWords.concat(previousWord);
      } else if (
        previousWord.substring(previousWord.length - 2, previousWord.length) ===
        artist_charactor
      ) {
        must_query.artist.push([
          previousWord.substring(0, previousWord.length - 2),
          "term",
        ]);
      } else {
        must_query._all.push([previousWord, "multi_match"]);
      }
      //handle next word
      var nextWord = wordList[i + 1];
      andWords.push(nextWord);
      if (nextWord[0] === '"') {
        must_query._all.push([nextWord, "multi_match_phrase"]);
        console.log("nextWord", nextWord);
        i++;
        andWords = andWords.concat(nextWord);
      } else if (
        nextWord.substring(nextWord.length - 2, nextWord.length) ===
        artist_charactor
      ) {
        must_query.artist.push([
          nextWord.substring(0, nextWord.length - 2),
          "term",
        ]);
        i++;
      } else {
        must_query._all.push([nextWord, "multi_match"]);
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

  i = 0;
  while (i < wordList.length) {
    var currentWord = wordList[i];
    var wordDouble = wordList[i] + " " + wordList[i + 1];
    //top # songs handle
    if (wordDouble === "හොඳම සින්දු" || wordDouble === "හොඳම ගීත") {
      var number = wordList[i + 2];
      number =
        numberMap[number] !== undefined ? numberMap[number] : parseInt(number);

      if (number === NaN) {
        number = 10;
      }
      sort_query.push({ rating: number });

      i += 3;
    } //between | less than | greater than mins
    else if (currentWord === "විනාඩි") {
      if (wordList[i + 2] == "වැඩි") {
        var number_g = wordList[i + 1];

        if (number_g[number_g.length - 1] === "ට") {
          number_g = number_g.substring(0, number_g.length - 1);
          number_g =
            numberMap[number_g] === undefined
              ? parseInt(number_g)
              : numberMap[number_g];
        } else {
          number_g =
            numberMap[number_g] === undefined
              ? parseInt(number_g)
              : numberMap[number_g];
        }
        must_query.duration.push([{ gte: number_g }, "range"]);
        if (wordList[i + 3] === "සින්දු" || wordList[i + 3] === "ගීත") {
          i++;
        }
        i += 3;
      } else if (wordList[i + 2] === "අඩු") {
        var number_l = wordList[i + 1];
        if (number_l[number_l.length - 1] === "ට") {
          number_l = number_l.substring(0, number_l.length - 1);
          number_l =
            numberMap[number_l] === undefined
              ? parseInt(number_l)
              : numberMap[number_l];
        } else {
          number_l =
            numberMap[number_l] === undefined
              ? parseInt(number_l)
              : numberMap[number_l];
        }
        must_query.duration.push([{ lte: number_l }, "range"]);
        if (wordList[i + 3] === "සින්දු" || wordList[i + 3] === "ගීත") {
          i++;
        }
        i += 3;
      } else if (wordList[i + 3] === "අතර") {
        var number_l = wordList[i + 1];
        var number_g = wordList[i + 2];

        if (number_l[number_l.length - 1] === "ත්") {
          number_l = number_l.substring(0, number_l.length - 1);
          number_l =
            numberMap[number_l] === undefined
              ? parseInt(number_l)
              : numberMap[number_l];
        } else {
          number_l =
            numberMap[number_l] === undefined
              ? parseInt(number_l)
              : numberMap[number_l];
        }
        if (number_g[number_g.length - 1] === "ත්") {
          number_g = number_g.substring(0, number_g.length - 1);
          number_g =
            numberMap[number_g] === undefined
              ? parseInt(number_g)
              : numberMap[number_g];
        } else {
          number_g =
            numberMap[number_g] === undefined
              ? parseInt(number_g)
              : numberMap[number_g];
        }
        must_query.duration.push([{ gte: number_l, lte: number_g }, "range"]);

        if (wordList[i + 4] === "සින්දු" || wordList[i + 4] === "ගීත") {
          i++;
        }

        i += 4;
      }
    } //write
    else if (currentWord === "ලිවූ" || currentWord === "රචිත") {
      must_query.lyrics_by.push([wordList[i - 1], "term"]);
      i++;
    } else if (
      currentWord === "ගයනා" ||
      currentWord === "ගැයූ" ||
      currentWord === "ගයන"
    ) {
      must_query.artist.push([wordList[i - 1], "term"]);
      i++;
    } else if (currentWord === "චිත්‍රපටයේ" || currentWord === "සලරුවේ") {
      must_query.movie.push([wordList[i - 1], "term"]);
      if (wordList[i + 1] === "සින්දු" || wordList[i + 1] === "ගීත") {
        i++;
      }
      i++;
    }

    // match phases handle
    else if (currentWord[0] === '"') {
      var phase = currentWord.substring(1, currentWord.length - 1);
      should_query._all.push([phase, "multi_match_phrase"]);
      console.log(phase);
      i += 1;
    } // normal term handle
    else if (
      currentWord.substring(currentWord.length - 2, currentWord.length) ===
      artist_charactor
    ) {
      should_queryartist.push([
        currentWord.substring(0, currentWord.length - 2),
        "term",
      ]);
      i++;
    } else {
      should_query._all.push([currentWord, "multi_match"]);
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

  return [must_query, should_query, sort_query];
}

var sample_text =
  "අමරදේව සහ ලතගෙ හොඳම ගීත 10 විනාඩි 3ත් 4ත් අතර ගීත සමන් රචිත අමර චිත්‍රපටයේ ගීත කමල් ලියූ";

t1 = Date.now();
const [a, b, c] = query_parser(sample_text);
t2 = Date.now();

function query_generator(must_query, should_query, sort_query) {
  var query = {};
  if (sort_query.length > 0) {
    query["size"] = sort_query[0].rating;
    query["sort"] = [{ rating: "desc", _score: "desc" }];
  }
  query["query"] = { bool: {} };
  //handle must query
  var is_must_started = false;
  for (key in must_query) {
    if (must_query[key].length !== 0) {
      if (!is_must_started) {
        query.query.bool["must"] = [];
        is_must_started = true;
      }

      for (valIndex = 0; valIndex < must_query[key].length; valIndex++) {
        switch (
          must_query[key][valIndex][must_query[key][valIndex].length - 1]
        ) {
          case "term":
            var temp_q_m = { match: {} };
            temp_q_m.match[key] = { query: must_query[key][valIndex][0] };
            query.query.bool.must.push(temp_q_m);
            break;
          case "multi_match_phrase":
            var temp_q_mm = {
              multi_match: {
                fields: [
                  "artist",
                  "lyrics",
                  "lyrics_by",
                  "music",
                  "movie",
                  "genre",
                  "song_name",
                ],
                type: "phrase",
              },
            };
            temp_q_mm.multi_match["query"] = must_query[key][valIndex][0];
            query.query.bool.must.push(temp_q_mm);
            break;
          case "range":
            var temp_q_r = { range: { duration: {} } };
            if (must_query[key][valIndex][0].gte !== undefined) {
              temp_q_r.range.duration["gte"] =
                must_query[key][valIndex][0].gte * 60;
            }
            if (must_query[key][valIndex][0].lte !== undefined) {
              temp_q_r.range["duration"]["lte"] =
                must_query[key][valIndex][0].lte * 60;
            }
            query.query.bool.must.push(temp_q_r);
            break;
          case "multi_match":
            var temp_q_mm = {
              multi_match: {
                fields: [
                  "artist",
                  "lyrics",
                  "lyrics_by",
                  "music",
                  "movie",
                  "genre",
                  "song_name",
                ],
              },
            };
            temp_q_mm.multi_match["query"] = must_query[key][valIndex][0];
            query.query.bool.must.push(temp_q_mm);
            break;
          default:
            break;
        }
      }
    }
  }
  var is_should_started = false;
  for (key in should_query) {
    if (should_query[key].length !== 0) {
      if (!is_should_started) {
        query.query.bool["should"] = [];
        is_should_started = true;
      }

      for (valIndex = 0; valIndex < should_query[key].length; valIndex++) {
        switch (
          should_query[key][valIndex][should_query[key][valIndex].length - 1]
        ) {
          case "term":
            var temp_q_m = { match: {} };
            temp_q_m.match[key] = { query: should_query[key][valIndex][0] };
            query.query.bool.should.push(temp_q_m);
            break;
          case "match_phrase":
            var temp_q_mp = { match_phrase: {} };
            temp_q_mp.match_phrase[key] = {
              query: should_query[key][valIndex][0],
            };
            query.query.bool.should.push(temp_q_mp);
            break;
          case "multi_match":
            var temp_q_mm = {
              multi_match: {
                fields: [
                  "artist",
                  "lyrics",
                  "lyrics_by",
                  "music",
                  "movie",
                  "genre",
                  "song_name",
                ],
              },
            };
            temp_q_mm.multi_match["query"] = should_query[key][valIndex][0];
            query.query.bool.should.push(temp_q_mm);
            break;
          default:
            break;
        }
      }
    }
  }

  return query;
}

q = query_generator(a, b, c);
q = JSON.stringify(q);
fs.writeFile("query.json", q, (err) => {
  if (err) console.log(err);
});
