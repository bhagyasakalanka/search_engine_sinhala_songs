const path = require("path");
const fs = require("fs");
const singlishParser = require("../simple_singlish_to_sinhala_parser/singlish_parser");
const genreParser = require("../simple_singlish_to_sinhala_parser/genre_parser");

//joining path of directory
const dir_path = "../songs/format_songs/site2_songs/";
const directoryPath = path.join(__dirname, dir_path);
const readline = require("readline");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const writFile = util.promisify(fs.writeFile);
no_author_list = [];

async function run() {
  await readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    async function asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index);
      }
    }
    asyncForEach(files, async (file, index) => {
      await processLineByLine(file, index);
    });
    // for (let index = 0; index < files.length; index++) {
    //   const file = files[index];
    //   processLineByLine(file, index);
    // }
  });
}

async function processLineByLine(filename, index) {
  id = "lyrics" + index;

  index_json = { _index: "song_lyrics", _id: id };

  data_json = {};

  //var fullSong = fs.readFileSync(dir_path + filename, "utf-8");

  const fileStream = fs.createReadStream(dir_path + filename);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  var fullSong = "";
  for await (const line of rl) {
    if (line.substring(0, 9) === "Song Name") {
      var songName = line.substring(10, line.length).trim().split("|");
      if (songName[1] === undefined) {
        songName = songName[0].split("–");
        if (songName[1] === undefined) {
          songName = songName[0].split("-");
        }
      }
      data_json["song_name"] = songName[1];
    } else if (line.substring(0, 6) === "Artist") {
      var artistName = line.substring(7, line.length).trim();

      artistName = singlishParser(artistName);
      data_json["artist"] = artistName;
    } else if (line.substring(0, 5) === "Genre") {
      var genre = line.substring(6, line.length).trim();
      genre = genreParser(genre);
      data_json["genre"] = genre;
    } else if (line.substring(0, 6) === "Lyrics") {
      var lyrics = line.substring(7, line.length).trim();
      lyrics = singlishParser(lyrics);
      data_json["lyrics_by"] = lyrics;
    } else if (line.substring(0, 5) === "Music") {
      var music = line.substring(6, line.length).trim();
      music = singlishParser(music);
      data_json["music"] = music;
    } else if (line.substring(0, 5) === "Movie") {
      var movie = line.substring(6, line.length).trim();
      movie = singlishParser(movie);
      data_json["movie"] = movie;
    } else {
      fullSong += line.trim() + "\n";
    }
  }
  data_json["duration"] = durationGenrator();
  data_json["rating"] = ratingsGenerator();
  data_json["lyrics"] = fullSong;

  fs.appendFile(
    "../data.txt",
    JSON.stringify({ index: index_json }) +
      "\n" +
      JSON.stringify(data_json) +
      "\n",
    function (err) {
      if (err) console.log(err);
    }
  );
}

function durationGenrator() {
  min = 0;
  sec = Math.floor(Math.random() * 60);

  randNum = Math.random();
  if (randNum <= 0.1) {
    min = 2;
  } else if (randNum <= 0.5) {
    min = 3;
  } else if (randNum <= 0.85) {
    min = 4;
  } else {
    min = 5;
  }
  return min * 60 + sec;
}
function ratingsGenerator() {
  ratings = 0;
  rand = Math.floor(Math.random() * 100);
  if (rand < 25) {
    ratings = 1;
  } else if (rand < 35) {
    ratings = 2;
  } else if (rand < 55) {
    ratings = 3;
  } else if (rand < 75) {
    ratings = 4;
  } else {
    ratings = 5;
  }
  return ratings;
}

run();

async function gTranslator(text) {
  const txtArr = text.split(" ");
  return googleTranslator(txtArr, { from: "en", to: "si" })
    .then(function (result) {
      return result.text;
    })
    .catch(function (error) {
      console.error(error);
    });
}

async function slinglishToSinhala(text) {
  if (text === "" || undefined) {
    return "";
  }
  var a = await gTranslator(text);
  if (a === undefined) {
    return "";
  }
  a = a.split("\n").join(" ");
  return a;
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
