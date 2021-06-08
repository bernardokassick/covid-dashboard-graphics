const data_type = {
  Deaths: "Mortes",
  Recovered: "Recuperados",
  Confirmed: "Confirmados",
};

let linesChart;

(function startPage() {
  let dateStart = document.getElementById("date_start");
  let dateEnd = document.getElementById("date_end");

  dateStart.value = new Date(2021, 04, 01).toISOString().substr(0, 10);
  dateStart.max = new Date(2021, 04, 01).toJSON().split("T")[0];

  dateEnd.value = new Date().toISOString().substr(0, 10);
  dateEnd.max = new Date().toJSON().split("T")[0];
  document.getElementById("filtro").addEventListener("click", handlerFilter);

  (async () => {
    let response = await Promise.allSettled([
      axios.get("https://api.covid19api.com/countries"),
      axios.get(
        `https://api.covid19api.com/country/Brazil?from=${new Date(
          2021,
          04,
          01,
          -3,
          0,
          0
        ).toISOString()}&to=${new Date(2021, 04, 25, -3, 0, 0).toISOString()}`
      ),
      axios.get(
        `https://api.covid19api.com/country/Brazil?from=${new Date(
          2021,
          03,
          30,
          -3,
          0,
          0
        ).toISOString()}&to=${new Date(2021, 04, 24, -3, 0, 0).toISOString()}`
      ),
    ]);
    if (response[0].status === "fulfilled") {
      let json = _.orderBy(response[0].value.data, ["Country"], ["asc"]);
      loadCountries(json);
    }

    if (
      response[1].status === "fulfilled" &&
      response[2].status === "fulfilled"
    ) {
      loadLineChart(response[1].value.data, response[2].value.data, "Deaths");
      loadKPI(response[1].value.data);
    }
  })();
})();

function loadCountries(json) {
  let combo = document.getElementById("cmbCountry");

  for (index in json) {
    combo.options[combo.options.length] = new Option(
      json[index].Country,
      json[index].Country,
      json[index].Country === "Brazil",
      json[index].Country === "Brazil"
    );
  }
}

function loadLineChart(json, jsonDelta, dataType) {
  let dates = _.map(json, "Date");

  let values = _.map(json, dataType);
  let deltaValues = _.map(jsonDelta, dataType);

  values = _.each(values, (x, index) => {
    values[index] = values[index] - deltaValues[index];
  });

  let avg = _.times(values.length, _.constant(_.mean(values)));

  linesChart = new Chart(document.getElementById("linhas"), {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          data: values,
          label: `Número de ${data_type[dataType]}`,
          borderColor: "rgb(255,140,13)",
        },
        {
          data: avg,
          label: `Média de ${data_type[dataType]}`,
          borderColor: "rgb(255,0,0)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top", //top, bottom, left, rigth
        },
        title: {
          display: true,
          text: "Curva diária de Covid-19",
          font: {
            size: 20,
          },
        },
        layout: {
          padding: {
            left: 100,
            right: 100,
            top: 50,
            bottom: 10,
          },
        },
      },
    },
  });
}

function loadKPI(json) {
  document.getElementById("kpiconfirmed").innerText =
    _.last(json).Confirmed.toLocaleString("PT");
  document.getElementById("kpideaths").innerText =
    _.last(json).Deaths.toLocaleString("PT");
  document.getElementById("kpirecovered").innerText =
    _.last(json).Recovered.toLocaleString("PT");
}

async function handlerFilter() {
  let dataCountry = document.getElementById("cmbCountry");

  let startDate = new Date(document.getElementById("date_start").value);

  let endDate = new Date(document.getElementById("date_end").value);

  endDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    -3,
    0,
    1,
    0
  );
  startDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate() + 1,
    -3,
    0,
    0,
    0
  );

  let startDateDelta = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    -3,
    0,
    0
  );
  let endDateDelta = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    -3,
    0,
    0,
    1
  );

  let response = await Promise.allSettled([
    axios.get(
      `https://api.covid19api.com/country/${
        dataCountry.value
      }?from=${startDate.toISOString()}&to=${endDate.toISOString()}`
    ),
    axios.get(
      `https://api.covid19api.com/country/${
        dataCountry.value
      }?from=${startDateDelta.toISOString()}&to=${endDateDelta.toISOString()}`
    ),
  ]);

  if (
    response[0].status === "fulfilled" &&
    response[1].status === "fulfilled"
  ) {
    linesChart.destroy();
    loadKPI(response[0].value.data);
    loadLineChart(
      response[0].value.data,
      response[1].value.data,
      document.getElementById("cmbData").value
    );
  }
}
