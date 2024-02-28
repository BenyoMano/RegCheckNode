const puppeteer = require("puppeteer");

async function checkVehicle(registrationNumber) {
  const url = `https://biluppgifter.se/fordon/${registrationNumber}`;
  let browser;

  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36"
    );
    await page.goto(url);
    const isPoliceVehicle = await page.evaluate(() => {
      return [...document.querySelectorAll("div")].some((div) =>
        div.textContent.includes("FORDONET KAN TILLHÖRA POLISEN")
      );
    });
    // console.log("isPoliceVehicle", isPoliceVehicle);

    let name, tel;

    if (!isPoliceVehicle) {
      const merInfoHref = await page.evaluate(() => {
        const anchor = document.querySelector(
          'a.gtm-merinfo[href*="www.merinfo.se"]'
        );
        // console.log("anchor", anchor);
        return anchor ? anchor.href : null;
      });
      // console.log("merinfo href", merInfoHref);

      if (merInfoHref) {
        await page.goto(merInfoHref);
        name = await page.evaluate(() => {
          const nameEl = document.querySelector("span.namn");
          return nameEl ? nameEl.textContent.trim() : null;
        });
        // console.log("Name:", name);

        tel = await page.evaluate(() => {
          const telEl = document.querySelector('a[href^="tel:"]');
          return telEl ? telEl.textContent.trim() : null;
        });
        // console.log("Tel:", tel);
      }
    }

    await browser.close();
    return { isPoliceVehicle, name, tel };
  } catch (error) {
    console.error("Error:", error);
    if (browser) {
      await browser.close();
    }
    return { error };
  }
}

module.exports = { checkVehicle };
