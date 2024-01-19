import { API_URL, API_KEY } from "./config.js";
import { getJSON } from "./helpers.js";
import "core-js/stable";
import { async } from "regenerator-runtime";

const screener = document.getElementById("screener");

export let stock = {};

let pokus = 4;

const createStockReportObject = function (data) {
  console.log(data);
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

const loadStock = async function () {
  try {
    const data = await getJSON(`${API_URL}${API_KEY}&ticker=PLTR`);
    stock = createStockReportObject(data.results[1]);
    console.log(stock);

    fillScreen();
  } catch (err) {
    console.error(
      `${err} - Příliš mnoho pokusů o připojení. Prosím, zkuste znovu za 1 minutu.`
    );
    // throw err;
  }
};
loadStock();

const fillScreen = function () {
  stock.start = new Date(stock.start);
  stock.end = new Date(stock.end);
  stock.start = new Intl.DateTimeFormat("cs-CZ").format(stock.start);
  stock.end = new Intl.DateTimeFormat("cs-CZ").format(stock.end);

  const basic_info = `
      <h3>${stock.company_name} (${stock.tickers})</h3>
      <p>Report pro <b>${stock.quarter} ${stock.year}</b>
      <br />(Období od ${stock.start} do ${stock.end})</p>
      <h4>Rozvaha</h4>
      <p>Aktiva: ${stock.financials.balance_sheet.assets.unit} ${stock.financials.balance_sheet.assets.value}
      <br />Pasiva: ${stock.financials.balance_sheet.liabilities.unit} ${stock.financials.balance_sheet.liabilities.value}</p>
      `;

  screener.insertAdjacentHTML("afterbegin", basic_info);
};
