//import { hexToU8a, isHex } from "@polkadot/util";

export function randomString(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function shortenNumber(number) {
  return nFormatter(number, 1);
}
function nFormatter(num, digits) {
  var si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}
export function isValidImage(imageUrl) {
  try {
    fetch(imageUrl).then((res) => {
      if (res.status === 200) return true;
      return false;
    });
  } catch (error) {
    console.log(error);
    return false;
  }
}

export function convertStringToPrice(stringPrice) {
  try {
    /* eslint-disable no-useless-escape */
    const a = stringPrice.replace(/\,/g, "");
    // let price = new BN(a, 10).div(new BN(10 ** 6)).toNumber();
    return a / 10 ** 12;
  } catch (error) {
    console.log(error);
    return 0;
  }
}

export function convertStringToDateTime(stringTimeStamp) {
  /* eslint-disable no-useless-escape */
  const a = stringTimeStamp.replace(/\,/g, "");
  const dateObject = new Date(parseInt(a));
  return dateObject.toLocaleString(); //2019-12-9 10:30:15
}

/*export function isValidAddressPolkadotAddress(address) {
    try {
      encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
  
      return true;
    } catch (error) {
      // console.log(error);
      return false;
    }
  }*/

export function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

export const convertTimeStamp = (input) => {
  let time = input.replace(/\,/g, "");
  if (time <= 0) return "";
  var d = new Date(time);
  return (
    twoDigit(d.getDate()) +
    "/" +
    twoDigit(d.getMonth() + 1) +
    "/" +
    d.getFullYear() +
    " " +
    twoDigit(d.getHours()) +
    ":" +
    twoDigit(d.getMinutes()) +
    ":" +
    twoDigit(d.getSeconds())
  );
};

export const secondsToTime = (secs) => {
  let hours = Math.floor(secs / (60 * 60));

  let divisor_for_minutes = secs % (60 * 60);
  let minutes = Math.floor(divisor_for_minutes / 60);

  let divisor_for_seconds = divisor_for_minutes % 60;
  let seconds = Math.ceil(divisor_for_seconds);

  let obj = {
    h: twoDigit(hours),
    m: twoDigit(minutes),
    s: twoDigit(seconds),
  };
  return obj;
};

export const convertTimeStampNoTime = (input) => {
  let time = input.replace(/\,/g, "");
  if (time <= 0) return "";
  var d = new Date(time);
  return (
    twoDigit(d.getDate()) +
    "/" +
    twoDigit(d.getMonth() + 1) +
    "/" +
    d.getFullYear()
  );
};

export const twoDigit = (myNumber) => {
  return ("0" + myNumber).slice(-2);
};

export const twoDigitTime = (time) => {
  if (time < 10) return "0" + time;
  else return time + "";
};

export const truncateStr = (str, n = 6) => {
  if (!str) return "";
  return str.length > n
    ? str.substr(0, n - 1) + "..." + str.substr(str.length - n, str.length - 1)
    : str;
};

export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const defaultMd = `# Introduction

A time-boxed security review of the **protocol name** protocol was done by **your_name**, with a focus on the security aspects of the application's implementation.

# Disclaimer

A smart contract security review can never verify the complete absence of vulnerabilities. This is a time, resource and expertise bound effort where I try to find as many vulnerabilities as possible. I can not guarantee 100% security after the review or even if the review will find any problems with your smart contracts.

# Protocol Overview

_explanation what the protocol does, some architectural comments_

# Severity classification

| Severity               | Impact: High | Impact: Medium | Impact: Low |
| ---------------------- | ------------ | -------------- | ----------- |
| **Likelihood: High**   | Critical     | High           | Medium      |
| **Likelihood: Medium** | High         | Medium         | Low         |
| **Likelihood: Low**    | Medium       | Low            | Low         |

# Security Assessment Summary

**_review commit hash_ - [fffffffff](url)**

### Scope

The following smart contracts were in scope of the audit:

- ${`smart-contract-name`}
- ${`smart-contract-name`}

The following number of issues were found, categorized by their severity:

- High: x issues
- Medium: x issues
- Low: x issues
- Informational: x issues

---

# Findings Summary

| ID     | Title                        | Severity      |
| ------ | ---------------------------- | ------------- |
| [H-01] | Any High Title Here          | High          |
| [M-01] | Any Medium Title Here        | Medium        |
| [L-01] | Any Low Title Here           | Low           |
| [I-01] | Any Informational Title Here | Informational |

# Detailed Findings

# [S-01] {name}

## Severity

**Likelihood:**

**Impact:**

## Description

## Recommendations
`;
