const artist_charactor = "s";
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
  };
  var should_query = {
    _all: [],
    artist: [],
    lyrics_by: [],
    music: [],
    duration: [],
    rating: [],
  };
  var must_not_query = {};
  var range_query = {};
  var top_query = {};
  var phase_query = [];
  var sort_query = [];
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
        must_query._all.push([phase, "match_phase"]);
        andWords = andWords.concat(andList);
      } else if (previousWord[previousWord.length - 1] === artist_charactor) {
        must_query.artist.push([
          previousWord.substring(0, previousWord.length - 1),
          "term",
        ]);
      } else {
        console.log(must_query);
        must_query._all.push([previousWord, "term"]);
      }
      //handle next word
      var nextWord = wordList[i + 1];
      andWords.push(nextWord);
      if (nextWord[0] === '"') {
        var [phase, andList] = findPhaseForword(i + 1);
        must_query._all.push([phase, "match_phase"]);
        andWords = andWords.concat(andList);
        i += andList.length + 1;
      } else if (nextWord[nextWord.length - 1] === artist_charactor) {
        must_query.artist.push([
          nextWord.substring(0, nextWord.length - 1),
          "term",
        ]);
        i++;
      } else {
        must_query._all.push([nextWord, "term"]);
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
    if (wordDouble === "best songs" || wordDouble === "top songs") {
      var number = wordList[i + 2];
      number =
        numberMap[number] !== undefined ? numberMap[number] : parseInt(number);
      console.log(number);
      if (number === NaN) {
        number = 10;
      }
      sort_query.push({ rating: number });

      i += 3;
    } //between | less than | greater than mins
    else if (currentWord === "minute") {
      if (wordList[i + 2] == "greater") {
        var number_g = wordList[i + 1];
        if (number_g[number_g.length - 1] === "t") {
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
        if (wordList[i + 3] === "sindu") {
          i++;
        }
        i += 3;
      } else if (wordList[i + 2] === "lesser") {
        var number_l = wordList[i + 1];
        if (number_l[number_l.length - 1] === "t") {
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
        if (wordList[i + 3] === "sindu") {
          i++;
        }
        i += 3;
      } else if (wordList[i + 3] === "between") {
        var number_l = wordList[i + 1];
        var number_g = wordList[i + 2];

        if (number_l[number_l.length - 1] === "x") {
          console.log("number_l", number_l);
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
        if (number_g[number_g.length - 1] === "x") {
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
        if (wordList[i + 4] === "sindu") {
          i++;
        }
        i += 4;
      }
    } // match phases handle
    else if (currentWord[0] === '"') {
      var [phase, andList] = findPhaseForword(i);
      should_query._all.push([phase, "match_phase"]);
      i += andList.length + 1;
    } // normal term handle
    else if (currentWord[currentWord.length - 1] === artist_charactor) {
      should_queryartist.push([
        currentWord.substring(0, currentWord.length - 1),
        "term",
      ]);
      i++;
    } else {
      should_query._all.push([currentWord, "term"]);
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

var sample_text = "amaradewas and latha minute 180 350t between top songs 10";

t1 = Date.now();
const [a, b, c] = query_parser(sample_text);
t2 = Date.now();
console.log(t2 - t1);

function query_generator(must_query, should_query, sort_query) {
  var query = {};
  var is_query_started = false;
  if (sort_query.length > 0) {
    console.log(sort_query[0].rating);
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
          case "match_phase":
            var temp_q_mp = { match_phase: {} };
            temp_q_mp.match_phase[key] = {
              query: must_query[key][valIndex][0],
            };
            query.query.bool.must.push(temp_q_mp);
            break;
          case "range":
            var temp_q_r = { range: { duration: {} } };
            if (must_query[key][valIndex][0].gte !== undefined) {
              temp_q_r.range.duration["gte"] = must_query[key][valIndex][0].gte;
            }
            if (must_query[key][valIndex][0].lte !== undefined) {
              temp_q_r.range["duration"]["lte"] =
                must_query[key][valIndex][0].lte;
            }
            query.query.bool.must.push(temp_q_r);
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
          case "match_phase":
            var temp_q_mp = { match_phase: {} };
            temp_q_mp.match_phase[key] = {
              query: should_query[key][valIndex][0],
            };
            query.query.bool.should.push(temp_q_mp);
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
