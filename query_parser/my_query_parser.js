const artist_charactor = "s";
function query_parser(text) {
  var must_query = [];
  var should_query = [];
  var must_not_query = {};
  var range_query = {};
  var top_query = {};
  var phase_query = [];
  const wordList = text.split(` `);

  function and_or_handler(textArr, t_index, field) {
    index = t_index;

    var obj = {};
    if (textArr[index + 1] !== "and" && textArr[index + 1] !== "or") {
      obj[field] = trim_artist_charactor(textArr[index]);
      should_query.push({
        obj,
      });

      return index + 1;
    } else {
      if (textArr[index + 1] === "and") {
        obj[field] = trim_artist_charactor(textArr[index]);
        must_query.push(obj);
        obj = {};
        obj[field] = trim_artist_charactor(textArr[index + 2]);
        must_query.push(obj);
      } else {
        obj[field] = trim_artist_charactor(textArr[index]);
        should_query.push(obj);
        obj = {};
        obj[field] = trim_artist_charactor(textArr[index + 2]);
        should_query.push({
          obj,
        });
      }

      return index + 3;
    }
  }

  var i = 0;
  var phase = "";
  var isInPhase = false;
  while (i < wordList.length) {
    if (wordList[i][0] === '"' || isInPhase) {
      isInPhase = true;
      if (wordList[i][0] === '"') {
        phase += wordList[i].substring(1, wordList[i].length) + " ";
      } else if (wordList[i][wordList[i].length - 1] === '"') {
        phase += wordList[i].substring(0, wordList[i].length - 1) + " ";
        phase_query.push({ _all: phase });

        phase = " ";
        isInPhase = false;
      } else {
        phase += wordList[i] + " ";
      }
      i++;
    } else if (wordList[i][wordList[i].length - 1] === artist_charactor) {
      i = and_or_handler(wordList, i, "artist");
    } else {
      i = and_or_handler(wordList, i, "_all");
      //should_query.push({ _all: wordList[i] });
      //i++;
    }
  }
  return [should_query, must_query, phase_query];
}

function trim_artist_charactor(word) {
  if (word[word.length - 1] === artist_charactor) {
    return word.substring(0, word.length - 1);
  }

  return word;
}

var sample_text = '1s 2 3 and 4 gf 5s and "6s fdf" dsdsd';
[a, b, c] = query_parser(sample_text);
console.log(a);
console.log(b);
console.log(c);
