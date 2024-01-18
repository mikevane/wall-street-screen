import { API_URL, API_KEY } from "./config.js";
import { getJSON } from "./helpers.js";

const screener = document.getElementById("screener");

export let stock = {
  company_name: "",
  tickers: [],
  financials: {},
  start: "",
  end: "",
  quarter: "",
  year: "",
};

const createStockReportObject = function (data) {
  console.log(data);
  const {
    company_name,
    tickers,
    financials,
    start_date: start,
    end_date: end,
    fiscal_period: quarter,
    fiscal_year: year,
  } = data;

  stock.company_name = company_name;
  // Ternary operator: if there's more tickers in the array, use 1st one
  tickers.length === 1
    ? (stock.tickers = tickers.toString())
    : (stock.tickers = tickers[0]);
  stock.financials = financials;
  stock.start = new Date(start);
  stock.end = new Date(end);
  stock.quarter = quarter;
  stock.year = year;

  return {
    company_name: stock.company_name,
    tickers: stock.tickers,
    financials: stock.financials,
    start: stock.start,
    end: stock.end,
    quarter: stock.quarter,
    year: stock.year,
  };
};

console.log(stock.company_name);

const loadSTOCK = async function () {
  try {
    const input = await getJSON(`${API_URL}${API_KEY}&ticker=PLTR`);
    stock = createStockReportObject(input.results[1]);
    console.log(stock.company_name);
    console.log(stock.tickers);
    console.log(stock.financials);
    // console.log(JSON.stringify(stock));
    console.log(
      `${stock.start} / ${stock.end} // ${stock.quarter} / ${stock.year}`
    );

    screener.insertAdjacentHTML("afterbegin", basic_info);

    // console.log(stock.financials.balance_sheet.assets.value);
  } catch (err) {
    console.error(`WARNING: ${err}`);
    throw err;
  }
};
loadSTOCK();

console.log(stock);
console.log(stock.company_name);

const basic_info = `<h3>${stock.company_name}</h3><p>Zpráva za období" ${stock.start}-${stock.end}</p><p>Lorem ipsim dolor sit amet.</p>`;
