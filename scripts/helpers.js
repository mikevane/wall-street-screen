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

// Formats string amounts: '12345567' -> '1 234 567'
export const formatAmount = function (num) {
  const parted = num.toString().replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
  return parted;
};

// Formats capitalized text into 1st letter caps: "AND IT WAS" -> "And It Was"
export const formatCaps = function (address) {
  let caps = address.toLowerCase().split(" ");

  for (let i = 0; i < caps.length; i++) {
    caps[i] = caps[i][0].toUpperCase() + caps[i].substring(1);
  }
  caps = caps.join().replaceAll(",", " ");

  return caps;
};

// Applies formatAmount() to a whole object through looping
export const loopAndFormat = function (object) {
  for (const item of Object.values(object)) {
    item.value = formatAmount(item.value);
  }
  return object;
};
