const path = require("path");
const fs = require("fs");
//joining path of directory
const directoryPath = path.join(
  __dirname,
  "../songs/unformat_songs/site2_songs/"
);
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
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      processLineByLine(file);
    }
    //   files.forEach(function (file) {
    //     // Do whatever you want to do with the file

    //   });
  });
  await writFile("../no_author.txt", no_author_list, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Saved!", "no_author");
    }
  });
}

async function processLineByLine(filename) {
  const fileStream = fs.createReadStream(
    "../songs/unformat_songs/site2_songs/" + filename
  );

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  var formattedSong = "";
  const englishLetters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    if (line === "") {
      formattedSong += line + "\n";
    } else {
      if (
        line.substring(0, 9) === "Song Name" ||
        line.substring(0, 6) === "Artist" ||
        line.substring(0, 5) === "Genre" ||
        line.substring(0, 6) === "Lyrics" ||
        line.substring(0, 5) === "Music" ||
        line.substring(0, 6) === "CHORUS" ||
        line.substring(0, 5) === "VERSE" ||
        line.substring(0, 6) === "VEARSE" ||
        line.substring(0, 5) === "Movie"
      ) {
        formattedSong += line + "\n";
      } else if (
        englishLetters.includes(line[0].toLowerCase()) ||
        line[0] === " " ||
        line[0] === "|" ||
        line[0] === ""
      ) {
        continue;
      } else {
        formattedSong += line + "\n";
      }
    }
    if (
      line.substring(0, 7) === "author:" &&
      line.substring(7, line.length) === " "
    ) {
      no_author_list.push(filename);
      fs.appendFile("../no_author.txt", filename + "\n", (err) => {
        if (err) console.log(err);
      });
    }
  }
  formattedSong = formattedSong.replace("author", "Singer");
  fs.writeFile(
    "../songs/format_songs/site2_songs/" + filename,
    formattedSong,
    function (err) {
      if (err) console.log(err);
    }
  );
}

run();
