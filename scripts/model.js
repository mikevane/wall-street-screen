import { API_URL_2, API_URL_3, API_KEY } from "./config.js";
import { getJSON, formatAmount } from "./helpers.js";
import "core-js/stable";
import { async } from "regenerator-runtime";

let screener = document.getElementById("screener");
const searchField = document.querySelector(".search__field");
const searchButton = document.querySelector(".search__btn");

let stock = {};
let company = {};

// Converting financial data received from API into more usable format
const createStockReportObject = function (data) {
  console.log(data);
  // desctructuring "data" object received in loadStock function
  let {
    company_name,
    // tickers,
    financials,
    start_date: start,
    end_date: end,
    fiscal_period: quarter,
    fiscal_year: year,
  } = data;

  // // Ternary operator
  // tickers.length === 1
  //   ? (tickers = tickers.toString()) // if there's 1 ticker in the array, simply convert array to a string
  //   : (tickers = tickers[0]); // if there's more tickers in the array, use 1st one

  return {
    company_name: company_name,
    // tickers: tickers,
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
    // name,
    ticker,
    address,
    branding: logo,
    total_employees: employees,
    market_cap,
    description,
  } = data;

  return {
    // name: name,
    ticker: ticker,
    address: address,
    logo: logo,
    employees: employees,
    market_cap: market_cap,
    description: description,
  };
};

// Load stock that is requested through search field
const loadStock = async function (ticker) {
  try {
    // Calls API with a requested ticker
    const fin_data = await getJSON(`${API_URL_2}${API_KEY}&ticker=${ticker}`);
    // Converts data using another function
    stock = createStockReportObject(fin_data.results[1]);

    // Calls API with a requested ticker
    const comp_data = await getJSON(`${API_URL_3}${ticker}?apiKey=${API_KEY}`);
    // Converts data using another function
    company = createStockCompanyObject(comp_data.results);

    // Testing logs
    console.log(stock);
    console.log(company);

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

  // Formats amount strings from 1234567 to 1 234 567
  const assets = formatAmount(stock.financials.balance_sheet.assets.value);
  const liabilities = formatAmount(
    stock.financials.balance_sheet.liabilities.value
  );
  const curAssets = formatAmount(
    stock.financials.balance_sheet.current_assets.value
  );
  const curLiabilities = formatAmount(
    stock.financials.balance_sheet.current_liabilities.value
  );
  const nonCurAssets = formatAmount(
    stock.financials.balance_sheet.noncurrent_assets.value
  );
  const nonCurLiabilities = formatAmount(
    stock.financials.balance_sheet.noncurrent_liabilities.value
  );
  const equity = formatAmount(stock.financials.balance_sheet.equity.value);
  const equityAndLiab = formatAmount(
    stock.financials.balance_sheet.liabilities_and_equity.value
  );
  const capitalization = formatAmount(Math.trunc(company.market_cap));
  const employed = formatAmount(company.employees);

  // Formats other strings as necessary
  const about = company.description.slice(0, 300);
  const street = company.address.address1.toLowerCase();
  const city =
    company.address.city.slice(0, 1) +
    company.address.city.substring(1).toLowerCase();

  // Saves company logo into local storage
  localStorage.setItem("logo_img", company.logo.icon_url);
  const logo = localStorage.getItem("logo_img");

  // Empties old data if there's any
  screener.innerHTML = "";

  // Creates the HTML
  const basic_info = `      
        <div class="wrapper">
        <div>
          <h3>${stock.company_name} (${company.ticker})</h3>
          <img src="${logo}" alt="${company.ticker} logo" />
          <p><span class="item">Adresa:</span> ${street}, ${city}, ${company.address.postal_code}, ${company.address.state}
          <br /><span class="item">Počet zaměstnanců:</span> ${employed}
          <br /><span class="item">Tržní kapitalizace:</span> $ ${capitalization}
          <p />
          <p><span class="item">Popis:</span> ${about}...</p>
          <span class="item">Výňatek z finanční zprávy za ${stock.quarter} ${stock.year}:</span><br />
          (Období od ${stock.start} do ${stock.end})
        </div>
        <table>
          <th colspan="4"><h4>Rozvaha<h4></h4></th>
          <tr>
            <td>Aktiva celkem:</td>
            <td>${assets}</td>
            <td>Závazky celkem:</td>
            <td>${liabilities}</td>
          </tr>
          <tr>
              <td>Oběžná aktiva</td>
              <td>${curAssets}</td>
              <td>Krátkodobé závazky:</td>
              <td>${curLiabilities}</td>
            </tr>
            <tr>
              <td>Dlouhodobý majetek:</td>
              <td>${nonCurAssets}</td>
              <td>Dlouhodobé závazky:</td>
              <td>${nonCurLiabilities}</td>
            </tr>
            <tr>
              <td colspan="2">Celkový kapitál:</td>
              <td colspan="2">${equity}</td>
            </tr>
            <tr>
              <td colspan="2">Celkový kapitál + závazky</td>
              <td colspan="2">${equityAndLiab}</td>
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
// 1) Fix lower/uppercase in the street string
// 2) Figure out saving and displaying of images from API
// 3) Fix error handling, and display error in the screener properly formatted
// 4) loading older reports as well
// 5) Refactoring

// CONTENT
// 1) Load more financial data (almost all of them)
