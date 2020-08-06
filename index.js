const cheerio = require("cheerio");
const qs = require("qs");
const axios = require("axios");
const fs = require("fs");

const getResults = async (start, end) => {
  let err = "";
  let data = "المدرسة,رقم الجلوس,المجموع,النسبة,الشعبة,اﻷسم";
  // الحالة,
  data += "\n";
  while (start <= end) {
    let body = qs.stringify({
      seating_no: start,
    });

    try {
      const response = await axios({
        method: "post",
        url: "https://natega.youm7.com/Home/Result",
        data: body,
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });

      // console.log(response.data);
      const $ = cheerio.load(response.data);
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

      console.log(start);
    } catch (error) {
      err += start + "\n";
      console.log(error);
      // data=data+"error,error,error,error,\n";
    }
    // await sleep(200);
    start++;
  }

  return { data: data, err: err };
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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
    let resultsAll = await getResults(250240, 252426);

    fs.writeFileSync("results.csv", resultsAll.data);
    fs.writeFileSync("error.csv", resultsAll.err);

    console.log("\n\n Results file created.");
  })();
}
