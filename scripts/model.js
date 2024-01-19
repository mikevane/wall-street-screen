import { API_URL, API_KEY } from "./config.js";
import { getJSON, formatAmount } from "./helpers.js";
import "core-js/stable";
import { async } from "regenerator-runtime";

let screener = document.getElementById("screener");
const searchField = document.querySelector(".search__field");
const searchButton = document.querySelector(".search__btn");

let stock = {};

// Converting data received from API into more usable format
const createStockReportObject = function (data) {
  console.log(data);
  // desctructuring "data" object received in loadStock function
  let {
    company_name,
    tickers,
    financials,
    start_date: start,
    end_date: end,
    fiscal_period: quarter,
    fiscal_year: year,
  } = data;

  // Ternary operator
  tickers.length === 1
    ? (tickers = tickers.toString()) // if there's 1 ticker in the array, simply convert array to a string
    : (tickers = tickers[0]); // if there's more tickers in the array, use 1st one

  return {
    company_name: company_name,
    tickers: tickers,
    financials: financials,
    start: start,
    end: end,
    quarter: quarter,
    year: year,
  };
};

// Load stock that is requested through search field
const loadStock = async function (ticker) {
  try {
    // Calls API with a requested ticker
    const data = await getJSON(`${API_URL}${API_KEY}&ticker=${ticker}`);
    // Converts data using another function
    stock = createStockReportObject(data.results[1]);
    console.log(stock);
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
  // Empties old data if there's any
  screener.innerHTML = "";

  // Creates the HTML
  const basic_info = `      
        <div class="wrapper">
        <div>
          <h3>${stock.company_name} (${stock.tickers})</h3>
          Report pro <b>${stock.quarter} ${stock.year}</b><br />
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
// 1) Fix error handling, and display error in the screener properly formatted
// 2) loading older reports as well
// CONTENT
// 1) Load more financial data (almost all of them)
