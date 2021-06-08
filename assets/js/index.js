(async () => {
  let response = await axios.get('https://api.covid19api.com/summary');
  loadSummary(response.data);
})();

function loadSummary(json) {
  loadKPI(json);
  loadPieChart(json);
  loadBarChart(json);
}

function loadKPI(json) {
  document.getElementById('confirmed').innerText =
    json.Global.TotalConfirmed.toLocaleString('PT');
  document.getElementById('death').innerText =
    json.Global.TotalDeaths.toLocaleString('PT');
  document.getElementById('recovered').innerText =
    json.Global.TotalRecovered.toLocaleString('PT');
  document.getElementById(
    'date'
  ).innerText = `Data de atualização ${json.Date}`;
}

function loadBarChart(json) {
  let countriesDeathsSorted = _.orderBy(
    json.Countries,
    ['TotalDeaths', 'Country'],
    ['desc', 'asc']
  );

  let countriesDeathsFiltered = _.slice(countriesDeathsSorted, 0, 10);

  let countriesMapped = _.map(countriesDeathsFiltered, 'Country');
  let totalDeathsMapped = _.map(countriesDeathsFiltered, 'TotalDeaths');

  let bar = new Chart(document.getElementById('barras'), {
    type: 'bar',
    data: {
      labels: countriesMapped,
      datasets: [
        {
          label: 'Total de Mortes',
          data: totalDeathsMapped,
          backgroundColor: 'rgba(153, 102, 255)',
        },
      ],
    },
    options: {
      reponsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Top 10 número de mortes por país',
          font: {
            size: 20,
          },
        },
      },
    },
  });
}
function loadPieChart(json) {
  let data = [
    json.Global.NewConfirmed,
    json.Global.NewDeaths,
    json.Global.NewRecovered,
  ];

  let pizza = new Chart(document.getElementById('pizza'), {
    type: 'pie',
    data: {
      labels: ['Confirmados', 'Mortes', 'Recuperados'],
      datasets: [
        {
          data: data,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: true,
          text: 'Distribuição de novos casos',
          font: {
            size: 20,
          },
        },
      },
    },
  });
}
