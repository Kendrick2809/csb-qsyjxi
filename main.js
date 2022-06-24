// const axios = require("axios").default;
const cacheAvailable = "caches" in self;

const urlOne = {
  method: "GET",
  url:
    "https://yfapi.net/v6/finance/quote?region=SG&lang=en&symbols=C52.SI%2CC6L.SI%2CG07.SI%2CC07.SI%2CU11.SI%2CS68.SI%2CZ74.SI%2CD05.SI%2CS58.SI%2CU96.SI",
  headers: {
    "X-API-KEY": "Y9UUJuV4uQ5fn8Ocs8OeZ7NJsDRF5mRu6wsti1hz"
  }
};

const urlTwo = {
  method: "GET",
  url:
    "https://yfapi.net/v6/finance/quote?region=SG&lang=en&symbols=H78.SI%2CBN4.SI%2CO39.SI%2C9CI.SI%2CQ0F.SI%2CS63.SI%2CVC2.SI%2CME8U.SI%2CBUOU.SI%2CU96.SI",
  headers: {
    "X-API-KEY": "Y9UUJuV4uQ5fn8Ocs8OeZ7NJsDRF5mRu6wsti1hz"
  }
};

const urlIndex = {
  method: "GET",
  url:
    "https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=%5ESTI%2C%5EN225%2C%5EHSI%2C%5EFTSE%2C%5EGSPC%2C%5EDJI%2C%5EIXIC%2C%5ECMC200",
  headers: {
    "X-API-KEY": "Y9UUJuV4uQ5fn8Ocs8OeZ7NJsDRF5mRu6wsti1hz"
  }
};

// "Value", "Future", "Past", "Health", "Dividend"
//  textVolume,
// textAverageVolume,
// textMarketCap,
// textPE,
// textPB,
// textChangePercent
let sortedPortfolioIndex = [0, 1, 2, 3, 4];
const price = [];
const volume = [];
const marketCap = [];
const PE = [];
const PB = [];

const requestOne = axios.request(urlOne);
const requestTwo = axios.request(urlTwo);
const requestIndex = axios.request(urlIndex);

axios
  .all([requestOne, requestTwo, requestIndex])
  .then(
    axios.spread((...responses) => {
      const responseOne = responses[0];
      const responseTwo = responses[1];
      console.log(responseOne, responseTwo);
      const dataArray1 = responseOne.data.quoteResponse.result;
      const dataArray2 = responseTwo.data.quoteResponse.result;
      const dataArray = [...dataArray1, ...dataArray2];

      const dataArrayLength = dataArray.length;

      for (let i = 0; i < dataArrayLength; i++) {
        price.push(dataArray[i].regularMarketPrice);
        volume.push(dataArray[i].regularMarketVolume);
        marketCap.push(dataArray[i].marketCap);
        PE.push(dataArray[i].forwardPE);
        PB.push(dataArray[i].priceToBook);
      }

      const priceChartData = scoringSystem(price);
      const volumeChartData = scoringSystem(volume);
      const marketCapChartData = scoringSystem(marketCap);
      const PEChartData = scoringSystem(PE);
      const PBChartData = scoringSystem(PB);

      const convertDataArray = convertData(
        priceChartData,
        volumeChartData,
        marketCapChartData,
        PEChartData,
        PBChartData
      );

      console.log(convertDataArray);
      if (window.location.pathname == "./index") {
        for (let i = 0; i < dataArrayLength; i++) {
          const currentID = `convert-data-${i}`;

          addRowToDom(
            currentID,
            convertDataArray[i],
            dataArray[i].symbol,
            dataArray[i].longName,
            dataArray[i].regularMarketPrice,
            dataArray[i].regularMarketChange.toFixed(4),
            dataArray[i].regularMarketChangePercent.toFixed(2),
            convertNumberFormat(dataArray[i].regularMarketVolume),
            convertNumberFormat(dataArray[i].averageDailyVolume3Month),
            convertNumberFormat(dataArray[i].marketCap),
            dataArray[i].forwardPE,
            dataArray[i].priceToBook,
            "tr",
            "table-body"
          );
        }
      }

      const sortedPortfolioIndexLength = sortedPortfolioIndex.length;

      for (let i = 0; i < sortedPortfolioIndexLength; i++) {
        const currentID = `convert-data-${sortedPortfolioIndex[i]}`;
        const chartID = `chart-id-${sortedPortfolioIndex[i]}`;
        addDOMtoPorfolioPage(
          convertDataArray,
          chartID,
          `dataArray${sortedPortfolioIndex[i]}.symbol`,
          `dataArray${sortedPortfolioIndex[i]}.longName`,
          `dataArray${sortedPortfolioIndex[i]}.RegularMarketPrice`,
          `dataArray${sortedPortfolioIndex[i]}.RegularMarketChangePercent`
        );
      }

      const responseThree = responses[2];
      const dataArrayIndex = responseThree.data.quoteResponse.result;
      console.log(dataArrayIndex);
      const indexArrayLength = dataArrayIndex.length;
      for (let i = 0; i < indexArrayLength; i++) {
        addIndexRowToDom(
          dataArrayIndex[i].shortName,
          dataArrayIndex[i].regularMarketPrice,
          dataArrayIndex[i].regularMarketChange,
          dataArrayIndex[i].regularMarketChangePercent
        );
      }

      checkButton();
      addToPortfolio();
    })
  )

  .catch(function (error) {
    console.error(error);
  });

const addIndexRowToDom = function (
  textName,
  textPrice,
  textChange,
  textChangePercent
) {
  textPrice = roundDecimal(textPrice);
  textChange = roundDecimal(textChange);
  textChangePercent = roundDecimal(textChangePercent);

  const divTag = document.createElement("div");
  divTag.setAttribute("class", "col index-col-width");
  const nameEl = document.createElement("div");
  nameEl.innerText = textName;
  nameEl.setAttribute("class", "index-name");
  const priceEl = document.createElement("div");
  priceEl.innerText = textPrice;
  priceEl.setAttribute("class", "index-price");
  const changeEl = document.createElement("div");
  changeEl.innerText = `${textChange} (${textChangePercent}%)`;
  changeEl.setAttribute("class", "index-change");
  setColorChange(textChange, changeEl);

  divTag.appendChild(nameEl);
  divTag.appendChild(priceEl);
  divTag.appendChild(changeEl);

  const parentSelector = document.getElementById("index-row");
  parentSelector.appendChild(divTag);
};

const setColorChange = function (textChange, changeEl) {
  if (textChange > 0) {
    changeEl.setAttribute("style", "color:green");
  } else if (textChange == 0) {
    changeEl.setAttribute("style", "color:blue");
  } else {
    changeEl.setAttribute("style", "color:red");
  }
};

const addDOMtoPorfolioPage = function (
  convertDataArray,
  chartID,
  textSymbol,
  textName,
  textPrice,
  textChangePercent
) {
  if (sortedPortfolioIndex.length > 0) {
    const chartEl = document.createElement("canvas");
    chartEl.setAttribute("id", chartID);
    makeChart(convertDataArray, chartID);
    document.getElementById(chartID).appendChild(clone);

    const colContainerEl = document.createElement("div");
    colContainerEl.setAttribute("class", "col porto-col-width");

    const rowEl = document.createElement("row");
    rowEl.setAttribute("class", "row portfolio-box-padding");

    const colChartEl = document.createElement("div");
    colChartEl.setAttribute("class", "col chart-portfolio");
    colChartEl.appendChild(chartEl);

    const colPortEl = document.createElement("div");
    colPortEl.setAttribute("class", "col-8");

    const col1stRowInfo = document.createElement("div");
    col1stRowInfo.setAttribute("class", "col-symbol col-price");
    col1stRowInfo.innerText(`${textSymbol} ${textPrice}`);

    const col2ndRowInfo = document.createElement("div");
    col2ndRowInfo.setAttribute("class", "col-name");
    col2ndRowInfo.innerText(textName);

    const col3rdRowInfo = document.createElement("div");
    col3rdRowInfo.setAttribute("class", "col-percent-change");
    col3rdRowInfo.innerText(textChangePercent);
  }
};

const addRowToDom = function (
  currentID,
  convertDataArray,
  textSymbol,
  textName,
  textPrice,
  textChange,
  textChangePercent,
  textVolume,
  textAverageVolume,
  textMarketCap,
  textPE,
  textPB,
  childSelector,
  parentSelector
) {
  //create tag for table framework
  const rowEl = document.createElement("th");
  rowEl.setAttribute("scope", "row");
  const symbolEl = document.createElement("td");
  symbolEl.setAttribute("class", "symbol");
  const nameEl = document.createElement("td");
  nameEl.setAttribute("class", "stock-name");
  const priceEl = document.createElement("td");
  const changeEl = document.createElement("td");
  const changePercentEl = document.createElement("td");
  const volumeEl = document.createElement("td");
  const averageVolumeEl = document.createElement("td");
  const marketCapEl = document.createElement("td");
  const peEl = document.createElement("td");
  const pbEl = document.createElement("td");

  const chartEl = document.createElement("td");
  const chartPalette = document.createElement("canvas");

  chartPalette.setAttribute("id", currentID);
  chartEl.setAttribute(
    "style",
    "padding: 0 0; position:relative; height:2vh ;width:2vw"
  );

  chartPalette.setAttribute("class", "radarChart");
  chartEl.appendChild(chartPalette);

  //create sub-child for checkbox
  const divEl = document.createElement("div");
  divEl.setAttribute("class", "form-check");
  const inputEl = document.createElement("input");
  inputEl.setAttribute("class", "form-check-input");
  inputEl.setAttribute("type", "checkbox");
  inputEl.setAttribute("value", "");
  inputEl.setAttribute("id", "flexCheckDefault");
  divEl.appendChild(inputEl);
  rowEl.appendChild(divEl);

  //create sub-child for a href at symbol tag
  const aRefEl = document.createElement("a");
  aRefEl.setAttribute("class", "link-primary");
  const hrefName = `./${textSymbol}.html`;
  aRefEl.setAttribute("href", hrefName);
  aRefEl.innerText = textSymbol;
  symbolEl.appendChild(aRefEl);

  setColorChange(textChange, changeEl);
  setColorChange(textChange, changePercentEl);

  //append all the tag to the table row
  const childEl = document.createElement(childSelector);
  childEl.appendChild(rowEl);
  childEl.appendChild(symbolEl);
  childEl.appendChild(nameEl);
  childEl.appendChild(priceEl);
  childEl.appendChild(changeEl);
  childEl.appendChild(changePercentEl);
  childEl.appendChild(volumeEl);
  childEl.appendChild(averageVolumeEl);
  childEl.appendChild(marketCapEl);
  childEl.appendChild(peEl);
  childEl.appendChild(pbEl);
  childEl.appendChild(chartEl);

  const parentEl = document.getElementById(parentSelector);

  textPE = roundDecimal(textPE);
  textPB = roundDecimal(textPB);

  nameEl.innerText = textName;
  priceEl.innerText = textPrice;
  changeEl.innerText = textChange;
  changePercentEl.innerText = `${textChangePercent}%`;
  volumeEl.innerText = textVolume;
  averageVolumeEl.innerText = textAverageVolume;
  marketCapEl.innerText = textMarketCap;
  peEl.innerText = textPE;
  pbEl.innerText = textPB;

  parentEl.appendChild(childEl);

  makeChart(convertDataArray, currentID);

  //assign datalist for symbol El or nameEl
  dataListAssign(textSymbol, textName);
  checkUncheck();
};

const dataListAssign = function (textSymbol, textName) {
  const datalistEl = document.getElementById("list-suggestion");
  const optionEl = document.createElement("option");
  const suggestionText = textSymbol + " " + textName;
  optionEl.setAttribute("value", suggestionText);
  datalistEl.appendChild(optionEl);
};

const convertNumberFormat = function (value) {
  return Math.abs(Number(value)) >= 1.0e9
    ? (Math.abs(Number(value)) / 1.0e9).toFixed(2) + "B"
    : Math.abs(Number(value)) >= 1.0e6
    ? (Math.abs(Number(value)) / 1.0e6).toFixed(2) + "M"
    : Math.abs(Number(value)) >= 1.0e3
    ? (Math.abs(Number(value)) / 1.0e3).toFixed(2) + "K"
    : Math.abs(Number(value));
};

const roundDecimal = function (value) {
  Number(value);
  if (isNaN(Number(value)) === true) {
    return "-";
  } else {
    return Number(value).toFixed(2);
  }
};

const checkUncheck = function () {
  const tableBody = document.querySelectorAll("checkbox");
  console.log(tableBody.checked);
};

// nameEl.innerText = textName;
//   priceEl.innerText = textPrice;
//   changeEl.innerText = textChange;
//   changePercentEl.innerText = `${textChangePercent}%`;
//   volumeEl.innerText = textVolume;
//   averageVolumeEl.innerText = textAverageVolume;
//   marketCapEl.innerText = textMarketCap;
//   peEl.innerText = textPE;
//   pbEl.innerText = textPB;

const convertData = function (data1, data2, data3, data4, data5) {
  const groupArrayData = [];
  const dataLength = data1.length;
  for (let i = 0; i < dataLength; i++) {
    const arrayData = [data1[i], data2[i], data3[i], data4[i], data5[i]];
    groupArrayData.push(arrayData);
  }
  return groupArrayData;
};

const makeChart = function (chartData, currentID) {
  Chart.defaults.font.size = 0;
  const data = {
    labels: ["Price", "Volume", "MarketCap", "PE", "PB"],
    datasets: [
      {
        data: chartData,
        fill: true,
        backgroundColor: "rgba(25, 105, 255, 0.3)",
        borderColor: "rgb(255, 99, 132)",
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)"
      }
    ]
  };

  const config = {
    type: "radar",
    data: data,
    options: {
      scales: { r: { max: 100, min: 0 } },
      plugins: {
        labels: { font: { size: 2 } },

        legend: {
          labels: { font: { size: 2 } },
          display: false
        }
      },
      elements: {
        line: {
          borderWidth: 1
        },
        point: { pointRadius: 0.5 }
      }
    }
  };

  const myChart = new Chart(document.getElementById(currentID), config);
};

const scoringSystem = function (array) {
  const arrayLength = array.length;
  for (let i = 0; i < arrayLength; i++) {
    if (isNaN(Number(array[i])) === true) {
      array[i] = 0;
    }
  }

  const max = Math.max(...array);
  const mapArray = array.map((item) => Math.floor((item / max) * 75) + 25);
  console.log(max);
  console.log(mapArray);
  return mapArray;
};

// const invertScoringSystem = function (array) {
//   // const sum = array.reduce((a, b) => a + b, 0);

//   const arrayLength = array.length;
//   for (let i = 0; i < arrayLength; i++) {
//     if (isNaN(Number(array[i])) === true) {
//       array[i] = 0;
//     }
//   }
//   const max = Math.max(...array);
//   const mapArray = array.map((item) => 100 - Math.floor((item / max) * 75));
//   console.log(max);
//   console.log(mapArray);
//   return mapArray;
// };
let allChecklist = "";
let allChecklistLength = "";
const portfolioArrayIndex = [];

const checkButton = function () {
  const parentSelector = document.getElementById("table-body");
  parentSelector.onclick = function (event) {
    const elementClicked = event.target;
    // const elementWithEventHandler = event.currentTarget;

    console.log(elementClicked.id);
    console.log(event.currentTarget);
    console.log(elementClicked.parentElement);

    if (elementClicked.id == "flexCheckDefault") {
      allChecklist = document.querySelectorAll("#flexCheckDefault");

      allChecklistLength = allChecklist.length;
      let status = false;

      for (let i = 0; i < allChecklistLength; i++) {
        if (allChecklist[i].checked == true) {
          status = true;
        }
      }

      if (status == true) {
        document.getElementById("add-to-portfolio").disabled = false;
      } else {
        document.getElementById("add-to-portfolio").disabled = true;
      }

      console.log(status);
    }

    // if (elementClicked.id == "add-to-portfolio") {
    //   for (let i = 0; i < allChecklistLength; i++) {
    //     if (allChecklist[i].checked == true) {
    //       portfolioArrayIndex.push(i);
    //     }
    //   }
    // }

    // console.log(portfolioArrayIndex);
  };
};

const addToPortfolio = function (item) {
  const addToPortoParentSelector = document.getElementById("add-to-porto-row");
  console.log(addToPortoParentSelector);
  addToPortoParentSelector.onclick = function (event) {
    const elementClicked = event.target;
    if (elementClicked.id == "add-to-portfolio") {
      for (let i = 0; i < allChecklistLength; i++) {
        if (allChecklist[i].checked == true) {
          portfolioArrayIndex.push(i);
        }
      }
    }
    sortedPortfolioIndex = [...new Set(portfolioArrayIndex)];
    console.log(portfolioArrayIndex);
    console.log(sortedPortfolioIndex);

    setTimeout(() => {
      alert(`Successfully added to your portfolio.`);
    }, 2);
  };
};
