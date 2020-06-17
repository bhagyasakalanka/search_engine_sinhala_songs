const puppeteer = require("puppeteer");
var fs = require("fs");

const main = async () => {
  const args = ["--disable-setuid-sandbox", "--no-sandbox"];
  const options = {
    args,
    headless: false,
    ignoreHTTPSErrors: true,
    userDataDir: "./usrdir",
  };
  const browser = await puppeteer.launch(options);

  var isPageError = false;
  pageCount = 0;
  while (pageCount < 24) {
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
    console.log("pageCount", pageCount);
    pageCount++;
    indexInside = 0;
    var is_inside_complete = false;
    try {
      while (!is_inside_complete) {
        indexInside++;
        console.log("pageIndex", indexInside);
        url =
          "https://sinhalasongbook.com/all-sinhala-song-lyrics-and-chords/?_page=" +
          pageCount;
        await page.goto(url);
        console.log("goto page", url);
        await page.waitForSelector(
          "#pt-cv-view-9c94ff8o8i > div > div:nth-child(" +
            indexInside +
            ") > div > h4 > a"
        );
        console.log(await page.url());
        // const [newTarget] = await Promise.all([
        //   // Await new target to be created with the proper opener
        //   new Promise((x) =>
        //     browser.on("targetcreated", (target) => {
        //       if (target.opener() !== page.target()) return;
        //       browser.removeListener("targetcreated", arguments.callee);
        //       x();
        //     })
        //   ),
        //   page.click(
        //     "#pt-cv-view-9c94ff8o8i > div > div:nth-child(" +
        //       indexInside +
        //       ") > div > h4 > a"
        //   ),
        // ]);
        // Attach to the newly opened page.
        // const newpage = await browser.targets()[2].page();
        //const pageX = pageList[pageList.length - 1];

        const newPagePromise = new Promise((x) =>
          browser.once("targetcreated", (target) => x(target.page()))
        );
        await page.click(
          "#pt-cv-view-9c94ff8o8i > div > div:nth-child(" +
            indexInside +
            ") > div > h4 > a"
        );
        // handle Page 2: you can access new page DOM through newPage object
        const newPage = await newPagePromise;
        await newPage.waitForSelector("body");

        // const [newPage, tabTwo] = await browser.pages();

        // // use the tabs Page objects properly
        // console.log("Tab One Title ", await newPage.url());

        // // use the tabs Page objects properly
        // console.log("Tab Two Title ", await tabTwo.url());
        // //await newPage.waitForNavigation();
        // console.log(await newPage.url());
        count = 0;
        while (count < 2) {
          try {
            try {
              await newPage.waitForSelector(
                "#genesis-content > article > div.entry-content > div.su-row > div.su-column.su-column-size-3-5 > div > pre",
                { timeout: 7000 }
              );

              var innerText = await newPage.evaluate(() => {
                return document.querySelector(
                  "#genesis-content > article > div.entry-content > div.su-row > div.su-column.su-column-size-3-5 > div > pre"
                ).innerText;
              });
            } catch (error) {
              await newPage.waitForSelector(
                "#genesis-content > article > div.entry-content > pre",
                { timeout: 7000 }
              );

              var innerText = await newPage.evaluate(() => {
                return document.querySelector(
                  "#genesis-content > article > div.entry-content > pre"
                ).innerText;
              });
            }
            break;
          } catch (error) {
            count++;
          }
        }

        var name = await newPage.evaluate(() => {
          return document.querySelector(
            "#genesis-content > article > div.entry-content > h2"
          ).innerText;
        });
        var author = "";
        try {
          author = await newPage.evaluate(() => {
            return document.querySelector(
              "#genesis-content > article > div.entry-content > h6"
            ).innerText;
          });
        } catch (error) {
          author = "";
        }
        var metadata = "";
        try {
          metadata = await newPage.evaluate(() => {
            return document.querySelector(
              "#genesis-content > article > div.entry-content > div:nth-child(1)"
            ).innerText;
          });
        } catch (error) {
          metadata = await newPage.evaluate(() => {
            return document.querySelector(
              "#genesis-content > article > div.entry-content > div.su-row"
            ).innerText;
          });
        }

        fs.writeFile(
          "../songs/unformat_songs/site2_songs/" + name.split("|")[0] + ".txt",
          "Song Name: " +
            name +
            "\n" +
            metadata +
            "\n" +
            "Singer: " +
            author +
            "\n\n" +
            innerText,

          function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log("Saved!", name);
            }
          }
        );

        newPage.close();
      }
    } catch (error) {
      console.log(error);
      console.log("error", indexInside, pageCount);
      isPageError = true;
      page.close();
    }
  }
};

main();
