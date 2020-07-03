const artist_charactor = "ගෙ";
var fs = require("fs");
const numberMap = {
  එක: 1,
  දෙක: 2,
  තුන: 3,
  හතර: 4,
  පහ: 5,
  හය: 6,
  හත: 7,
  අට: 8,
  නවය: 9,
  නමය: 9,
  දහය: 10,
};

const keywords = [
  "ගැයූ",
  "රචිත",
  "චිත්‍රපටයේ",
  "සලරුවේ",
  "ත්",
  "ට",
  "ගෙ",
  "ලිවූ",
  "ගයන",
  "ගයනා",
  "විනාඩි",
  "සින්දු",
  "ගීත",
  "ලියූ",
  "සහ",
  "හා",
];
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
  var filter_query = { duration: [] };
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
    if (wordList[i] === "සහ" || wordList[i] === "හා") {
      //handle previous word
      var previousWord = wordList[i - 1];
      andWords.push(previousWord);
      andWords.push(wordList[i]);
      if (previousWord[0] === '"') {
        must_query._all.push([
          removeQuotos(previousWord),
          "multi_match_phrase",
        ]);

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
        must_query._all.push([removeQuotos(nextWord), "multi_match_phrase"]);
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
        console.log(number_g);
        filter_query.duration.push([{ gte: number_g }, "range"]);
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
        filter.duration.push([{ lte: number_l }, "range"]);
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
        filter_query.duration.push([{ gte: number_l, lte: number_g }, "range"]);

        if (wordList[i + 4] === "සින්දු" || wordList[i + 4] === "ගීත") {
          i++;
        }

        i += 4;
      }
    } //write
    else if (
      currentWord === "ලිවූ" ||
      currentWord === "රචිත" ||
      currentWord === "ලියූ"
    ) {
      must_query.lyrics_by.push([removeQuotos(wordList[i - 1]), "term"]);
      if (wordList[i + 1] === "සින්දු" || wordList[i + 1] === "ගීත") {
        i++;
      }
      i += 1;
    } else if (
      currentWord === "ගයනා" ||
      currentWord === "ගැයූ" ||
      currentWord === "ගයන"
    ) {
      must_query.artist.push([removeQuotos(wordList[i - 1]), "term"]);
      if (wordList[i + 1] === "සින්දු" || wordList[i + 1] === "ගීත") {
        i++;
      }
      i += 1;
    } else if (currentWord === "චිත්‍රපටයේ" || currentWord === "සලරුවේ") {
      must_query.movie.push([removeQuotos(wordList[i - 1]), "term"]);
      if (wordList[i + 1] === "සින්දු" || wordList[i + 1] === "ගීත") {
        i++;
      }
      i += 1;
    }

    // match phases handle
    else if (currentWord[0] === '"') {
      if (!keywords.includes(wordList[i + 1])) {
        var phase = currentWord.substring(1, currentWord.length - 1);
        should_query._all.push([phase, "multi_match_phrase"]);
      }

      i += 1;
    } // normal term handle
    else if (
      currentWord.substring(currentWord.length - 2, currentWord.length) ===
      artist_charactor
    ) {
      should_query.artist.push([
        currentWord.substring(0, currentWord.length - 2),
        "term",
      ]);
      i++;
    } else {
      if (!keywords.includes(wordList[i + 1])) {
        should_query._all.push([currentWord, "multi_match"]);
      }
      i++;
    }
  }
  function removeQuotos(text) {
    var txt = text;
    if (txt[0] === '"') {
      txt = txt.substring(1, txt.length);
    }
    if (txt[txt.length - 1] === '"') {
      txt = txt.substring(0, txt.length - 1);
    }
    return txt;
  }

  return [must_query, should_query, sort_query, filter_query];
}

function query_generator(must_query, should_query, sort_query, filter_query) {
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
                  "artist^2",
                  "lyrics^4",
                  "lyrics_by^1",
                  "music^1",
                  "movie^2",
                  "genre^2",
                  "song_name^3",
                ],
                type: "phrase",
              },
            };
            temp_q_mm.multi_match["query"] = must_query[key][valIndex][0];
            query.query.bool.must.push(temp_q_mm);
            break;

          case "multi_match":
            var temp_q_mm = {
              multi_match: {
                fields: [
                  "artist^4",
                  "lyrics^4",
                  "lyrics_by^2",
                  "music^2",
                  "movie^1",
                  "genre^2",
                  "song_name^3",
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
          case "multi_match_phrase":
            var temp_q_mm = {
              multi_match: {
                fields: [
                  "artist^2",
                  "lyrics^4",
                  "lyrics_by^1",
                  "music^1",
                  "movie^2",
                  "genre^2",
                  "song_name^3",
                ],
                type: "phrase",
              },
            };
            temp_q_mm.multi_match["query"] = should_query[key][valIndex][0];
            query.query.bool.should.push(temp_q_mm);
            break;
          case "multi_match":
            var temp_q_mm = {
              multi_match: {
                fields: [
                  "artist^4",
                  "lyrics^4",
                  "lyrics_by^2",
                  "music^2",
                  "movie^1",
                  "genre^2",
                  "song_name^3",
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
  var is_filter_started = false;
  for (key in filter_query) {
    if (filter_query[key].length !== 0) {
      if (!is_filter_started) {
        query.query.bool["filter"] = [];
        is_filter_started = true;
      }
      for (valIndex = 0; valIndex < filter_query[key].length; valIndex++) {
        switch (
          filter_query[key][valIndex][filter_query[key][valIndex].length - 1]
        ) {
          case "range":
            var temp_q_r = { range: { duration: {} } };
            if (filter_query[key][valIndex][0].gte !== undefined) {
              temp_q_r.range.duration["gte"] =
                filter_query[key][valIndex][0].gte * 60;
            }
            if (filter_query[key][valIndex][0].lte !== undefined) {
              temp_q_r.range["duration"]["lte"] =
                filter_query[key][valIndex][0].lte * 60;
            }
            query.query.bool.filter.push(temp_q_r);
            break;
          default:
            break;
        }
      }
    }
  }

  return query;
}
var q1 = "දීවරයො චිත්‍රපටයේ ගීත ";
var q2 = "ජෝතිපාලගෙ සහ ලතාගෙ සින්දු ";
var q3 = "ජෝතිපාල හා ලතාගෙ සින්දු ";
var q4 = "අමරදේවගෙ හොඳම ගීත 10 ";
var q5 = "මිල්ටන්ගෙ විනාඩි 3ට වැඩි සින්දු ";
var q6 = "කපුගේගෙ විනාඩි 3ත් 4ත් අතර හොඳම ගීත 10 ";
var q7 = '"කරුනාරත්න අබේසේකර" ලිවූ සින්දු ';
var q8 = '"කරුනාරත්න අබේසේකර" ලිවූ හොඳම ගීත 20 ';
var q9 = '"අතින් අතට" චිත්‍රපටයේ සින්දු';
var q10 = "දීවරයො චිත්‍රපටයේ ගීත ";
var q11 = "කසුන්ගෙ සින්දු";
var q12 = "අඬන්නෙ ඇයි සුදු මැණිකේ";
var q13 = '"අඬන්නෙ ඇයි සුදු මැණිකේ" ';
var q14 = "අම්මා ";
t1 = Date.now();
const [a, b, c, d] = query_parser(q6);
q = query_generator(a, b, c, d);
t2 = Date.now();
console.log(t2 - t1);
q = JSON.stringify(q);
fs.writeFile("query.json", q, (err) => {
  if (err) console.log(err);
});
