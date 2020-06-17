const puppeteer = require("puppeteer");
var fs = require("fs");

const main = async () => {
  const args = ["--disable-setuid-sandbox", "--no-sandbox"];
  const options = {
    args,
    headless: false,
    ignoreHTTPSErrors: true,
  };
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.resourceType === "Image") {
      request.abort();
    } else {
      request.continue();
    }
  });
  await page.setViewport({
    width: 1920,
    height: 2000,
  });
  var isComplete = false;
  index = 0;
  while (!isComplete) {
    index++;
    url =
      "https://sinhala.lyrics-lk.com/artist/%e0%b6%b1%e0%b6%af%e0%b7%93%e0%b6%9a-%e0%b6%9c%e0%b7%94%e0%b6%bb%e0%b7%94%e0%b6%9c%e0%b7%9a/";

    try {
      //await page.goto("https://lyrics-lk.com/si/");
      await page.goto(url);
      //   await page.waitForSelector(
      //     "body > div.container > div > div > div.row > div:nth-child(1) > ul"
      //   );

      //   await page.click(
      //     "body > div.container > div > div > div.row > div:nth-child(1) > ul > li:nth-child(" +
      //       index +
      //       ") > a"
      //     );

      //   await page.waitForSelector(
      //     "#text-12 > div > ul > li:nth-child(" + index + ") > a",
      //     { timeout: 10000 }
      //   );

      //   await page.click("#text-12 > div > ul > li:nth-child(" + index + ") > a");

      await page.waitForSelector(
        "#main > div.row > div:nth-child(" + index + ") > h2 > a",
        { timeout: 10000 }
      );

      await page.click(
        "#main > div.row > div:nth-child(" + index + ") > h2 > a"
      );
      //   await page.waitForSelector('div[class="lyric-content"]', {
      //     timeout: 10000,
      //   });

      //   var innerText = await page.evaluate(() => {
      //     return document.getElementsByClassName("lyric-content").innerText;
      //   });
      await page.waitForSelector("body > div > div", { timeout: 10000 });

      var innerText = await page.evaluate(() => {
        return document.querySelector("body > div > div").innerText;
      });
      fs.writeFile(
        "./" + innerText.substring(0, 11) + ".txt",
        innerText,
        function (err) {
          if (err) console.log(err);
          console.log("Saved!", innerText.substring(0, 11));
        }
      );
      console.log(innerText.substring(0, 11));
    } catch (error) {
      console.log(error);
      console.log("completed");
      isComplete = true;
    }
  }

  //   const texts = await page.evaluate(() => {
  //     return [
  //       ...document.body.querySelectorAll(
  //         "body > div.container > div > div > div.row > div:nth-child(1) > ul"
  //       ),
  //     ]
  //       .map((element) => element.innerText)
  //       .join("\n");
  //   });

  //   const pTags = await page.$$("li").innerText;

  await browser.close();
};

main();
