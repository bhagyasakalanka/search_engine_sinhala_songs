const path = require("path");
const fs = require("fs");
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

  var fullSong = fs.readFileSync(dir_path + filename, "utf-8");

  const fileStream = fs.createReadStream(dir_path + filename);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.substring(0, 9) === "Song Name") {
      data_json["සින්දුව"] = line.split(":")[1];
    } else if (line.substring(0, 6) === "Artist") {
      data_json["ගායකයා"] = line.split(":")[1];
    } else if (line.substring(0, 5) === "Genre") {
      data_json["වර්ගය"] = line.split(":")[1];
    } else if (line.substring(0, 6) === "Lyrics") {
      data_json["පද_රචනය"] = line.split(":")[1];
    } else if (line.substring(0, 5) === "Music") {
      data_json["සංගීතය"] = line.split(":")[1];
    } else if (line.substring(0, 5) === "Movie") {
      data_json["චිත්‍රපටය"] = line.split(":")[1];
    }
  }
  data_json["කාලය  "] = durationGenrator();
  data_json["ඇගැයුම"] = ratingsGenerator();
  data_json["පද"] = fullSong;

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
