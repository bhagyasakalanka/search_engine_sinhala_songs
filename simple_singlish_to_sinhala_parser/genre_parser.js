const keyword_mapping = {
  classics: "ශාෂ්ත්‍රීය",
  old: "පරණ",
  pops: "පොප්",
  golden: "ස්වර්ණමය ",
  pop: "පොප්",
  request: "ඇරයුම්",
  movie: "චිත්‍රපට",
  songs: "සින්දු",
  inspirational: "පොලඹවන සුලු",
  new: "නව",
  duets: "යුගල",
  current: "වර්තමන",
  oldies: "පරණ",
  " ": " ",
};

module.exports = (text) => {
  text = text.toLowerCase();
  const textArr = text.split(",");
  var outside_word = "";
  textArr.forEach((element) => {
    var inside_word = "";
    const space_divider = element.split(" ");
    space_divider.forEach((ele) => {
      if (ele === "" || ele === " ") {
        inside_word += " ";
      } else {
        inside_word += keyword_mapping[ele] + " ";
      }
    });

    outside_word += inside_word + ",";
  });
  return outside_word.substring(0, outside_word.length - 1);
};
