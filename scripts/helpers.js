import { TIMEOUT } from "./config.js";
import "core-js/stable";
import { async } from "regenerator-runtime";

export const getJSON = async function (url) {
  try {
    const res = await Promise.race([fetch(url), timeout(TIMEOUT)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    console.error(
      err`Příliš mnoho pokusů o připojení. Prosím, zkuste znovu za + minutu.`
    );
  }
};

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// Formats string mounts from '12345567' to '1 234 567'
export const formatAmount = function (num) {
  const parted = num.toString().replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
  return parted;
};
