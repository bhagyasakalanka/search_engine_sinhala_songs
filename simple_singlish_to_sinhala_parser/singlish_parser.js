const single_unicodes = {
  b: "0DB6",
  c: "0D9A",
  d: "0DAF",
  f: "0DC6",
  g: "0D9C",
  h: "0DC4",
  j: "0DA2",
  k: "0D9A",
  l: "0DBD",
  m: "0DB8",
  n: "0DB1",
  p: "0DB4",
  q: "0D9A",
  r: "0DBB",
  s: "0DC3",
  t: "0DA7",
  v: "0DC0",
  w: "0DC0",
  x: "0D82",
  y: "0DBA",
  z: "0DC1",
};

const sir_names = {
  a: "ඒ",
  b: "බී",
  c: "සී",
  d: "ඩී",
  e: "ඊ",
  f: "එෆ්",
  g: "ජී",
  h: "එච්",
  i: "අයි",
  j: "ජේ",
  k: "කේ",
  l: "එල්",
  m: "එම්",
  n: "එන්",
  o: "ඕ",
  p: "පී",
  q: "කිව්",
  r: "ආර්",
  s: "එස්",
  t: "ටී",
  u: "යූ",
  v: "වී",
  w: "ඩබ්ලිව්",
  x: "එක්ස්",
  y: "වයි",
  z: "ඉසෙඩ්",
};

const double_unicodes = {
  th: "0DAD",
  dh: "0DAF",
  gn: "0DA5",
  sh: "0DC2",
  ch: "0DA0",
  kh: "0D9B",
  bh: "0DB7",
  gh: "0D9D",
  ng: "0D82",
  cy: "0DC3",
};

const symbol_unicodes = {
  a: "",
  e: "0DD9",
  i: "0DD2",
  o: "0DDC",
  u: "0DD4",
};
const double_symbol_unicodes = {
  aa: "0DCF",
  ae: "0DD0",
  ee: "0DD3",
  ii: "0DD3",
  uu: "0DD6",
  oo: "0DDD",
  ie: "0DD3",
  ey: "0DDA",
};
const doublevowels = {
  aa: "0D86",
  ae: "0D87",
  ee: "0D92",
  ii: "0D8A",
  uu: "0D8C",
  oo: "0D94",
};
const vowels = { a: "0D85", e: "0D91", i: "0D89", o: "0D94", u: "0D8B" };
const hal = "0DCA";

module.exports = (textPhase) => {
  var txtArr = textPhase.split(",");
  var word = "";
  txtArr.forEach((element) => {
    word += one_text_parse(element) + ",";
  });
  return word.substring(0, word.length - 1);
};

function one_text_parse(text) {
  var text = text.toLowerCase();
  var unicode_string = "";
  var i = 0;
  while (i < text.length) {
    if (text[i] === " ") {
      unicode_string += " ";
      i++;
    } else if (text[i + 1] === ".") {
      unicode_string += sir_names[text[i]] + ".";
      i += 2;
    } else if (vowels[text[i]] !== undefined) {
      if (doublevowels[text[i] + text[i + 1]] !== undefined) {
        unicode_string += JSON.parse(
          `["\\u${doublevowels[text[i] + text[i + 1]]}"]`
        )[0];
        i += 2;
      } else {
        unicode_string += JSON.parse(`["\\u${vowels[text[i]]}"]`)[0];
        i++;
      }
    } else if (symbol_unicodes[text[i + 1]] !== undefined) {
      if (double_symbol_unicodes[text[i + 1] + text[i + 2]] !== undefined) {
        unicode_string += JSON.parse(`["\\u${single_unicodes[text[i]]}"]`)[0];
        unicode_string += JSON.parse(
          `["\\u${double_symbol_unicodes[text[i + 1] + text[i + 2]]}"]`
        )[0];
        i += 3;
      } else {
        unicode_string += JSON.parse(`["\\u${single_unicodes[text[i]]}"]`)[0];
        if (symbol_unicodes[text[i + 1]] !== "") {
          unicode_string += JSON.parse(
            `["\\u${symbol_unicodes[text[i + 1]]}"]`
          )[0];
        }
        i += 2;
      }
    } else if (
      single_unicodes[text[i + 1]] !== undefined &&
      double_unicodes[text[i] + text[i + 1]] !== undefined
    ) {
      if (symbol_unicodes[text[i + 2]] !== undefined) {
        if (double_symbol_unicodes[text[i + 2] + text[i + 3]] !== undefined) {
          unicode_string += JSON.parse(
            `["\\u${double_unicodes[text[i] + text[i + 1]]}"]`
          )[0];
          unicode_string += JSON.parse(
            `["\\u${double_symbol_unicodes[text[i + 2] + text[i + 3]]}"]`
          )[0];
          i += 4;
        } else {
          unicode_string += JSON.parse(
            `["\\u${double_unicodes[text[i] + text[i + 1]]}"]`
          )[0];

          if (symbol_unicodes[text[i + 2]] !== "") {
            unicode_string += JSON.parse(
              `["\\u${symbol_unicodes[text[i + 2]]}"]`
            )[0];
          }

          i += 3;
        }
      } else {
        unicode_string += JSON.parse(
          `["\\u${double_unicodes[text[i] + text[i + 1]]}"]`
        )[0];
        if (text[i] + text[i + 1] === "cy") {
          unicode_string += JSON.parse(`["\\u0DD2"]`)[0];
        } else if (text[i] + text[i + 1] !== "ng") {
          unicode_string += JSON.parse(`["\\u${hal}"]`)[0];
        }

        i += 2;
      }
    } else {
      unicode_string += JSON.parse(`["\\u${single_unicodes[text[i]]}"]`)[0];
      unicode_string += JSON.parse(`["\\u${hal}"]`)[0];
      i++;
    }
  }
  return unicode_string;
}
