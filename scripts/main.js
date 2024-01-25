import { API_URL_1, API_URL_2, API_URL_3, API_KEY } from "./config.js";
import { getJSON, formatAmount, formatCaps, loopAndFormat } from "./helpers.js";
import "core-js/stable";
import { async } from "regenerator-runtime";

let screener = document.getElementById("screener");
const searchField = document.querySelector(".search__field");
const searchButton = document.querySelector(".search__btn");

let stock = {};
let company = {};
let price = {};

// Converting financial data received from API into more usable format
const createStockFinanceObject = function (data) {
  console.log(data);
  // desctructuring "data" object received in loadStock function
  let {
    company_name,
    financials,
    start_date: start,
    end_date: end,
    fiscal_period: quarter,
    fiscal_year: year,
  } = data;

  return {
    company_name: company_name,
    financials: financials,
    start: start,
    end: end,
    quarter: quarter,
    year: year,
  };
};

// Converting company data received from API into more usable format
const createStockCompanyObject = function (data) {
  console.log(data);
  // desctructuring "data" object received in loadStock function
  let {
    ticker,
    address,
    branding: logo,
    total_employees: employees,
    market_cap,
    weighted_shares_outstanding: shares,
  } = data;

  return {
    ticker: ticker,
    address: address,
    logo: logo,
    employees: employees,
    market_cap: market_cap,
    shares: shares,
  };
};

// Converting market data received from API into more usable format
const createStockPriceObject = function (data) {
  console.log(data);
  // desctructuring "data" object received in loadStock function
  let { o: open, c: close } = data;

  return {
    open: open,
    close: close,
  };
};

// Load stock that is requested through search field
const loadStock = async function (ticker) {
  try {
    // Calls API for MARKET DATA with a requested ticker
    const market_data = await getJSON(
      `${API_URL_1}${ticker}/prev?adjusted=true&apiKey=${API_KEY}`
    );
    // Converts data using another function
    price = createStockPriceObject(market_data.results[0]);

    // Calls API for COMPANY DATA with a requested ticker
    const fin_data = await getJSON(`${API_URL_2}${API_KEY}&ticker=${ticker}`);
    // Converts data using another function
    stock = createStockFinanceObject(fin_data.results[1]);

    // Calls API for FINANCIAL DATA with a requested ticker
    const comp_data = await getJSON(`${API_URL_3}${ticker}?apiKey=${API_KEY}`);
    // Converts data using another function
    company = createStockCompanyObject(comp_data.results);

    // Testing logs
    console.log(stock);
    console.log(company);
    console.log(price);

    // Populates screener
    fillScreen();
  } catch (err) {
    console.error(
      `${err} - Příliš mnoho pokusů o připojení. Prosím, zkuste znovu za 1 minutu.`
    );
    // throw err;
  }
};

// Renders the data
const fillScreen = function () {
  // Formats dates into Czech format
  stock.start = new Date(stock.start);
  stock.end = new Date(stock.end);
  stock.start = new Intl.DateTimeFormat("cs-CZ").format(stock.start);
  stock.end = new Intl.DateTimeFormat("cs-CZ").format(stock.end);

  // Formats price quote into Czech format
  const quote = price.close.toString().replaceAll(".", ",");

  // Formats amount strings from "1234567" to "1 234 567"
  // -- for whole statement objects
  loopAndFormat(stock.financials.balance_sheet);
  loopAndFormat(stock.financials.income_statement);
  loopAndFormat(stock.financials.cash_flow_statement);
  // -- for standalone variables
  const capitalization = formatAmount(Math.trunc(company.market_cap));
  const employed = formatAmount(company.employees);
  const shares = formatAmount(company.shares);

  // Formats address from fully capitalized string into only 1st letter caps
  const street = formatCaps(company.address.address1);
  const city = formatCaps(company.address.city);

  // Calculates percentage change during previous day
  const change = (((price.close - price.open) / price.open) * 100)
    .toFixed(2)
    .replaceAll(".", ",");

  // Empties old data if there's any
  screener.innerHTML = "";

  // Creates the HTML

  const basic_info = `
        <div class="wrapper">

        <div>
          <h3>${stock.company_name}</h3>
          <img 
           src="${
             company.logo.logo_url
           }?apiKey=iYpKUMU5UrLYZZIWf5POL1faypVVku2Q"
           alt="${company.ticker} logo" 
           title="${company.ticker} logo" 
           class="branding"/>
          <p><span class="item">Kurz:</span> $${quote} <span class="item">Změna:</span> <span class="change
            ${change > 0 ? "gain" : "loss"}
          ">
          ${change > 0 ? "+" + change : change} %</span>
          <br /><span class="item">Ticker:</span> ${company.ticker}
          <br /><span class="item">Adresa:</span> ${street},
          ${city}, ${company.address.postal_code}, ${company.address.state}
          <br /><span class="item">Počet zaměstnanců:</span> ${employed}
          <br /><span class="item">Tržní kapitalizace:</span> $${capitalization}
          <p />
          <span class="item">Výňatek z finanční zprávy za
          ${stock.quarter} ${stock.year}:</span><br />
          (${stock.start} - ${stock.end})
        </div>

        <table>
          <th colspan="4"><h4>Rozvaha<h4></h4></th>
          <tr>
            <td>Aktiva celkem:</td>
            <td>${stock.financials.balance_sheet.assets.value}</td>
            <td>Závazky celkem:</td>
            <td>${stock.financials.balance_sheet.liabilities.value}</td>
          </tr>
          <tr>
              <td>Oběžná aktiva</td>
              <td>${stock.financials.balance_sheet.current_assets.value}</td>
              <td>Krátkodobé závazky:</td>
              <td>${
                stock.financials.balance_sheet.current_liabilities.value
              }</td>
            </tr>
            <tr>
              <td>Dlouhodobý majetek:</td>
              <td>${stock.financials.balance_sheet.noncurrent_assets.value}</td>
              <td>Dlouhodobé závazky:</td>
              <td>${
                stock.financials.balance_sheet.noncurrent_liabilities.value
              }</td>
            </tr>
            <tr>
              <td colspan="2">Celkový kapitál:</td>
              <td colspan="2">${
                stock.financials.balance_sheet.equity.value
              }</td>
            </tr>
            <tr>
              <td colspan="2">Celkový kapitál + závazky</td>
              <td colspan="2">${
                stock.financials.balance_sheet.liabilities_and_equity.value
              }</td>
            </tr>
        </table>

        <table>
          <th colspan="4"><h4>Cash-flow výkaz<h4></h4></th>
          <tr>
            <td>Aktiva celkem:</td>
            <td></td>
            <td>Závazky celkem:</td>
            <td></td>
          </tr>
          <tr>
              <td>Oběžná aktiva</td>
              <td></td>
              <td>Krátkodobé závazky:</td>
              <td></td>
            </tr>
            <tr>
              <td>Dlouhodobý majetek:</td>
              <td></td>
              <td>Dlouhodobé závazky:</td>
              <td></td>
            </tr>
            <tr>
              <td colspan="2">Celkový kapitál:</td>
              <td colspan="2"></td>
            </tr>
            <tr>
              <td colspan="2">Celkový kapitál + závazky</td>
              <td colspan="2"></td>
            </tr>
        </table>

        <table>
          <th colspan="4"><h4>Výkaz zisků a ztrát<h4></h4></th>
          <tr>
            <td>Příjmy:</td>
            <td>${
              stock.financials.income_statement.revenues !== undefined
                ? stock.financials.income_statement.revenues.value
                : "N/A"
            }</td>
            <td>Náklady na výnosy:</td>
            <td>${
              stock.financials.income_statement.cost_of_revenue !== undefined
                ? stock.financials.income_statement.cost_of_revenue.value
                : "N/A"
            }</td>
          </tr>
          <tr>
            <td colspan="2">Hrubý zisk:</td>
            <td colspan="2">${
              stock.financials.income_statement.gross_profit !== undefined
                ? stock.financials.income_statement.gross_profit.value
                : "N/A"
            }</td>
          </tr>
          <tr>
            <td colspan="2">Čistý zisk/ztráta:</td>
            <td colspan="2">${
              stock.financials.income_statement
                .net_income_loss_attributable_to_parent !== undefined
                ? stock.financials.income_statement
                    .net_income_loss_attributable_to_parent.value
                : "N/A"
            }</td>
          </tr>
          <tr>
            <td colspan="2">Vážený průměr počtu akcií v oběhu:</td>
            <td colspan="2">${shares !== undefined ? shares : "N/A"}</td>
          </tr>
          <tr>
            <td colspan="2">Čistý zisk/ztráta na akcii:</td>
            <td colspan="2">${
              stock.financials.income_statement.diluted_earnings_per_share !==
              undefined
                ? stock.financials.income_statement.diluted_earnings_per_share.value.replaceAll(
                    ".",
                    ","
                  )
                : "N/A"
            }</td>
          </tr>

        </table>

      </div>
    `;

  // Inserts the HTML into screener div
  screener.insertAdjacentHTML("afterbegin", basic_info);
};

// SEARCH FUNCIONALITY UPON CLICKING BUTTON
searchButton.addEventListener("click", function (e) {
  e.preventDefault();
  // Collects the ticker from the field
  const ticker = searchField.value;
  // Converst lower-cased tickers so the search works
  const tickerUppercased = ticker.toUpperCase();
  // Guard clause - execute only if ticker was passed
  if (!tickerUppercased) return;
  // Loads the stock using loadStock function
  loadStock(tickerUppercased);
  // Clears the search field for the next search
  searchField.value = "";
});

// SEARCH FUNCTIONALITY UPON HITTING ENTER KEY
searchField.addEventListener("keypress", function (e) {
  // If "Enter" key is pressed and released
  if (e.keyCode === 13) {
    // Simulates a "Search" button click
    searchButton.click();
  }
});

// -- TODO --
// CODING

// 6) Fix error handling, and display error in the screener properly formatted
// 5) Slider for statements
// 4) Replacing hamburger menu

// CONTENT
// 3) Load more financial data (almost all of them)

// WEBDESIGN
// 2) Gorgeous web-design
// 1) Responsive design using DOM manipulation
