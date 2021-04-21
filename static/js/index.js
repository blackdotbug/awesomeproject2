function setActiveButton(mon){
  let buttons = document.querySelectorAll("btn-secondary")
  buttons.forEach(btn => {btn.classList.remove("active")})
  let button = document.getElementById(mon)
  button.classList.add("active")
}
// https://learnwithparam.com/blog/how-to-group-by-array-of-objects-using-a-key/
// Accepts the array and key
const groupBy = (array, key, level) => {
  if (level == 1){
    // Return the end result
    return array.reduce((result, currentValue) => {
      // If an array already present for key, push it to the array. Else create an array and push the object
      (result[currentValue.attributes[key]] = result[currentValue.attributes[key]] || []).push(
        currentValue.attributes
      );
      // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
      return result;
    }, {}); // empty object is the initial value for result object
  } else {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
      currentValue
    );
      return result;
    }, {}); // empty object is the initial value for result object
  }
};

function buildStatusChart(array, year) {
  let statusGroups = groupBy(array, 'STATUS', 2)
  let statusKeys = Object.keys(statusGroups)
  barTraces = []
  statusKeys.forEach(status => {
    let orgGroups = groupBy(statusGroups[status], 'ORGANIZATIONACRONYM', 2)
    let orgs = Object.keys(orgGroups)
    let values = []
    orgs.forEach(org => values.push(orgGroups[org].length))
    let trace = {
      x: orgs,
      y: values,
      name: status,
      type: 'bar'
    }
    barTraces.push(trace)
  })

  var data = barTraces;
  var layout = {barmode: 'stack'};
  Plotly.newPlot(`graph2-${year}`, data, layout);

}

function buildDaysOpenChart(data) {
  let year2020 = data['2020'].filter(req => req.STATUS == 'Closed')
  let year2019 = data['2019'].filter(req => req.STATUS == 'Closed')
  let orgGroups2020 = groupBy(year2020, 'ORGANIZATIONACRONYM', 2)
  let orgs2020 = Object.keys(orgGroups2020)
  let values2020 = []
  orgs2020.forEach(org => {
    let allDays = orgGroups2020[org].map(req => req.DAYS_OPEN)
    let aveDays = allDays.reduce((a,b) => a + b, 0) / allDays.length
    values2020.push(Math.ceil(aveDays))
  })
  let trace2020 = {
    x: orgs2020,
    y: values2020,
    name: "2020",
    type: 'bar'
  }
  let orgGroups2019 = groupBy(year2019, 'ORGANIZATIONACRONYM', 2)
  let orgs2019 = Object.keys(orgGroups2019)
  let values2019 = []
  orgs2019.forEach(org => {
    let allDays = orgGroups2019[org].map(req => req.DAYS_OPEN)
    let aveDays = allDays.reduce((a,b) => a + b, 0) / allDays.length
    values2019.push(Math.ceil(aveDays))
  })
  let trace2019 = {
    x: orgs2019,
    y: values2019,
    name: "2019",
    type: 'bar'
  }
  var data = [trace2019, trace2020];
  var layout = {barmode: 'group'};
  Plotly.newPlot(`graph3`, data, layout);

}

function init(dupes) {
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox/light-v10",
    accessToken: MapboxToken
  });
  let map = L.map("map", {
    center: [38.9072, -77.0369],
    zoom: 12,
    layers: [lightmap]
  });
  lightmap.addTo(map);
  let parentGroup = L.markerClusterGroup(),
    m2019 = [],
    m2020 = []

  d3.json('/api/v1/data').then(data => {

    if (!dupes) {
      data = data.filter(req => req.attributes.DUPLICATE == false)
    }

    let testdate = moment(data[0].attributes.ADDDATE)
    setActiveButton(testdate.format("MMM"))

    data.forEach(location => {
      let adddate = moment(location.attributes.ADDDATE)
      let resolutiondate = moment(location.attributes.RESOLUTIONDATE)
      let daysopen = ''
      if (location.attributes.STATUS == "Closed"){
        daysopen = resolutiondate.diff(adddate, 'days')
      } else {
        daysopen = moment().diff(adddate, 'days')
      }
      location.attributes.DAYS_OPEN = daysopen
      let marker = L.marker([location.attributes.LATITUDE, location.attributes.LONGITUDE]).bindPopup(`
        <p><strong>Address:</strong> ${location.attributes.STREETADDRESS}<br/>
        <strong>Description:</strong> ${location.attributes.SERVICECODEDESCRIPTION}<br/>
        <strong>Added:</strong> ${adddate.format("MMM D, YYYY")}<br/>
        <strong>Status:</strong> ${location.attributes.SERVICEORDERSTATUS}<br/>
        <strong>Resolved:</strong> ${resolutiondate.format("MMM D, YYYY")}<br/>
        <strong>Days Open:</strong> ${location.attributes.DAYS_OPEN}</p>
      `)
      location.attributes.YEAR == "2019" ? m2019.push(marker) : m2020.push(marker)
    })
    sg2019 = L.featureGroup.subGroup(parentGroup, m2019)
    sg2020 = L.featureGroup.subGroup(parentGroup, m2020)
    parentGroup.addTo(map)
    sg2019.addTo(map)
    sg2020.addTo(map)
    let control = L.control.layers(null, null, { collapsed: false })
    control.addOverlay(sg2019, '2019');
    control.addOverlay(sg2020, '2020');
    control.addTo(map);
    let yearGroups = groupBy(data, 'YEAR', 1)
    buildStatusChart(yearGroups['2020'],'2020')
    buildStatusChart(yearGroups['2019'],'2019')
    buildDaysOpenChart(yearGroups)
  }).catch(error => console.log(error))

}

let statustabs = document.querySelectorAll('#statustabs a')
let statuspanels = document.querySelectorAll('#section2 .tab-pane')
statustabs.forEach(tab => {
  tab.addEventListener('click', function (e) {
    e.preventDefault()
    statustabs.forEach(tab => tab.classList.remove("active"))
    statuspanels.forEach(pane => pane.classList.remove("active"))
    this.classList.add("active")
    let pane = document.getElementById(this.dataset.controls)
    pane.classList.add("active")
    let chartdiv = pane.getElementsByTagName('div')
    Plotly.relayout(chartdiv[0].id, {autosize: true})
  })
})

let chkbx = document.getElementById('hideDupes')
chkbx.addEventListener('change', function (e) {
  let viz = document.querySelectorAll(".vizspace")
  viz.forEach(div => div.innerHTML = '')
  let graph1 = document.getElementById('graph1')
  let mapdiv = document.createElement('div')
  mapdiv.id = 'map'
  graph1.appendChild(mapdiv)

  if (e.currentTarget.checked) {
    init(false)
  } else {
    init(true)
  }
})

init(true)
