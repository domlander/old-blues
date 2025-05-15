import puppeteer from "puppeteer";

type Fixture = {
  home: string;
  away: string;
  date?: string;
  time?: string;
  venue?: string;
  competition?: string;
};

// FA Full Time SAL Senior division 3 fixtures
const url =
  "https://fulltime.thefa.com/fixtures/1/100.html?selectedSeason=66783998&selectedFixtureGroupKey=1_34734488";

export default async () => {
  const browser = await puppeteer.launch(); // launches an "invisible" chromium browser
  const page = await browser.newPage(); // takes the browser to a new tab (page)
  await page.goto(url); // takes the page to a specific url

  // NOTE: Anything inside of the `evaluate` function is DOM manipulation.
  // No variables outside of the evaluate function can go in, and none can come out without being returned inside of the return object.
  const allFixtures = await page.evaluate(() => {
    const cleanText = (el: Element): string => {
      return el.textContent?.trim().replace("\n", "").replace("\t", "") || "";
    };

    const fixtures: Fixture[] = [];

    // Select the table with all the fixtures and loop through each row
    document.querySelectorAll(".fixtures-table tr").forEach((row) => {
      const fixture: Fixture = { home: "", away: "" };

      row.querySelectorAll("td").forEach((td, j) => {
        switch (j) {
          case 1:
            fixture.date = td.querySelectorAll("span")[0].textContent || "";
            fixture.time = td.querySelectorAll("span")[1].textContent || "";
            break;
          case 2:
            fixture.home = cleanText(td);
            break;
          case 6:
            fixture.away = cleanText(td);
            break;
          case 7:
            fixture.venue = cleanText(td);
            break;
          case 8:
            fixture.competition = cleanText(td);
            break;
        }
      });

      fixtures.push(fixture);
    });

    const oldBluesFixtures = fixtures.filter(
      ({ home, away }) => home === "Old Blues" || away === "Old Blues"
    );

    return {
      fixtures: oldBluesFixtures,
    };
  });

  // print out the DOM data
  console.log("Fixtures:", allFixtures);

  // remember to close the broser (invisible chromium)
  await browser.close();

  return new Response(JSON.stringify(allFixtures), {
    headers: { "content-type": "application/json" },
  });
};
