const puppeteer = require("puppeteer");
const fs = require("fs");
const cheerio = require("cheerio");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let getResults = async function (start, end) {
  const browser = await puppeteer.launch({ headless: true });

  let data = "المدرسة,رقم الجلوس,المجموع,النسبة,الشعبة,اﻷسم";
  // الحالة,
  data += "\n";

  while (start <= end) {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    await page.goto("https://natega.youm7.com/");

    // Login form
    await page.screenshot({ path: __dirname + "/output/1.png" });

    // await page.type('input[name=search]', 'Adenosine triphosphate');
    await page.$eval("#seating_no", (el, start) => (el.value = start), start);

    await page.click('input[type="submit"]');

    // await sleep(2000)
    await page.waitForSelector(".all");

    await page.screenshot({ path: __dirname + "/output/2.png" });

    const aHandle = await page.evaluateHandle(() => document.body);
    const resultHandle = await page.evaluateHandle(
      (body) => body.innerHTML,
      aHandle
    );
    const $ = cheerio.load(await resultHandle.jsonValue());
    const urlElems = $(".nav-item");

    const schoolSpan = $(urlElems[4]).find("span")[1];
    const school = $(schoolSpan).text();
    data = data + school + ",";

    // const resSpan = $(urlElems[7]).find("span")[1];
    // const res = $(resSpan).text();
    // data=data+res+",";

    // We now loop through all the elements found
    for (let i = 0; i < 3; i++) {
      const urlSpan = $(urlElems[i]).find("h1")[0];
      const urlText = $(urlSpan).text();
      data = data + urlText + ",";

      // We then print the text on to the console
      // console.log(urlText);
    }

    const t = $(urlElems[9]).find("span")[1];
    const t2 = $(t).text();

    data = data + t2 + ",";

    const urlSpan = $(urlElems[3]).find("span")[1];
    const name = $(urlSpan).text();

    data = data + name;

    data += "\n";

    page.close();
    console.log(start);
    start++;
  }
  await browser.close();

  return { data: data };
};

var myArgs = process.argv.slice(2);

const start = myArgs[0];
const end = myArgs[1];

if (isNaN(start) || isNaN(end)) {
  console.log("Pass true start and end seating numbers.");
} else {
  (async () => {
    // console.log();

    // let results = await getResults(251065, 251204)
    // results += await getResults(252252, 252426)

    // fs.writeFileSync('results.csv', results);

    //250240, 252426
    let resultsAll = await getResults(start,end);

    fs.writeFileSync("results.csv", resultsAll.data);
    //   fs.writeFileSync("error.csv", resultsAll.err);

    console.log("\n\n Results file created.");
  })();
}
