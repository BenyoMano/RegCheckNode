const axios = require("axios");
const cheerio = require("cheerio");

async function checkIfVehicleBelongsToPolice(registrationNumber) {
  const url = `https://biluppgifter.se/fordon/${registrationNumber}`;
  try {
    // console.log("url:", url);
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36",
        Referer: "https://biluppgifter.se/",
      },
    });
    // console.log("response:", response);
    const html = response.data;
    // console.log("html:", html);
    const $ = cheerio.load(html);
    const isPoliceVehicle =
      $(html).find('div:contains("FORDONET KAN TILLHÖRA POLISEN")').length > 0;
    console.log("isPoliceVehicle:", isPoliceVehicle);
    if (!isPoliceVehicle) {
      const merInfo = $('a.gtm-merinfo[href*="www.merinfo.se"]');
      const exists = merInfo.length > 0;
      const href = exists ? merInfo.attr("href") : null;
      console.log("Merinfo href:", href);

      try {
        const response2 = await axios.get(href, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36",
            Referer: "https://biluppgifter.se/",
          },
        });
        const html2 = response2.data;
        const $2 = cheerio.load(html2);
        const nameClass = $2("span.namn");
        const name = nameClass.length > 0 ? nameClass.text().trim() : null;
        console.log("Name:", name);
        const telLink = $2('a.mi-whitespace-nowrap[href*="tel:46739384767"]');
        $2(`span:contains("073)`).each(function () {
          const phoneNumber = $2(this).text();
          console.log("PhoneNUmber", phoneNumber);
        });
        // $2('a[href^="tel:"]').each(function () {
        //   console.log("ping");
        //   const phoneHref = $2(this).attr("href");
        //   console.log("Each:", phoneHref);
        // });
        // console.log("telLink:", telLink);

        // console.log("telLink.html():", telLink.html());

        // const tel = telLink.length > 0 ? telLink.attr("href") : null;
        // console.log("Tel:", tel);
      } catch (error) {
        console.error("Error fetching or parsing MerInfo", error);
      }
    }
    return isPoliceVehicle;
  } catch (error) {
    console.error("Error fetching or parsing", error);
    return false;
  }
}

checkIfVehicleBelongsToPolice("SLL172");
// checkIfVehicleBelongsToPolice("BEA732");
// checkIfVehicleBelongsToPolice("FLJ497");

// <a href="#agare" class="font-weight-bold">
