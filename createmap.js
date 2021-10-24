let title = document.getElementById('title')
let mapBox = document.getElementById('mapbox')
let titleHeight  = title.offsetHeight
let windowHeight = window.innerHeight
let windowWidth = window.innerWidth
let mapBoxWidth = mapBox.offsetWidth
var mapWidth =  mapBoxWidth;
var mapHeight = mapBoxWidth*.75;

// Set up projection that the map is using
var scale = 190000*(mapBoxWidth/1000);
var projection = d3.geoMercator()
  .center([-122.061578, 37.385532]) 
  .scale(scale)
  .translate([mapWidth / 2, mapHeight / 2]);

// This is the mapping between <longitude, latitude> position to <x, y> pixel position on the map
// projection is a function and it has an inverse:
// projection([lon, lat]) returns [x, y]
// projection.invert([x, y]) returns [lon, lat]

// Add an SVG element to the DOM
var svg = d3.select('#mapbox').append('svg')
  .attr('width', mapWidth)
  .attr('height', mapHeight)
  // .attr('viewBox', `${0} ${-titleHeight/4} ${mapWidth} ${mapHeight}`)


// Add SVG map at correct size, assuming map is saved in a subdirectory called `data`
svg.selectAll('image').data([0]).enter().append('image')
  .attr('width', mapWidth)
  .attr('height', mapHeight)
  .attr('xlink:href', './map.svg');

var tooltip = d3.select("body").append("div")	
  .attr("class", "tooltip")				
  .style("opacity", 0);


let resData = null
let filteredResData = null
let filteredResDataPre = null

let areaCircles = [
  {
    'cx': mapWidth/4,
    'cy': mapHeight/2,
    'r': mapWidth/3.5,
    'id':0,
    'color': '#006064'
  },
  {
    'cx': mapWidth*(3/4),
    'cy': mapHeight/2,
    'r': mapWidth/3.5,
    'id':1,
    'color': '#263238'
  }
]

svg.append('line')
  .attr('x1',`${areaCircles[0].cx}`)
  .attr('y1',`${areaCircles[0].cy - 10}`)
  .attr('x2',`${areaCircles[0].cx}`)
  .attr('y2',`${areaCircles[0].cy + 10}`)
  .attr('stroke', 'black')
  .attr('stroke-width', 3)
  .attr('id', 'l00')

svg.append('line')
  .attr('x1',`${areaCircles[0].cx-10}`)
  .attr('y1',`${areaCircles[0].cy}`)
  .attr('x2',`${areaCircles[0].cx+10}`)
  .attr('y2',`${areaCircles[0].cy}`)
  .attr('stroke', 'black')
  .attr('stroke-width', 3)
  .attr('id', 'l01')

svg.append('line')
  .attr('x1',`${areaCircles[1].cx}`)
  .attr('y1',`${areaCircles[1].cy - 10}`)
  .attr('x2',`${areaCircles[1].cx}`)
  .attr('y2',`${areaCircles[1].cy + 10}`)
  .attr('stroke', 'black')
  .attr('stroke-width', 3)
  .attr('id', 'l10')

svg.append('line')
  .attr('x1',`${areaCircles[1].cx-10}`)
  .attr('y1',`${areaCircles[1].cy}`)
  .attr('x2',`${areaCircles[1].cx+10}`)
  .attr('y2',`${areaCircles[1].cy}`)
  .attr('stroke', 'black')
  .attr('stroke-width', 3)
  .attr('id', 'l11')


function getDistance(x1,y1,x2,y2){
  return Math.sqrt((x2-x1)**2+(y2-y1)**2)
}

function inCircle(item, circle){
  return getDistance(item.Latitude, item.Longitude, circle.cx, circle.cy)<circle.r
}

function setIsInclude(data, areaCircles){
  data.forEach(item => {
    if (inCircle(item, areaCircles[0]) && inCircle(item, areaCircles[1])){
      item.isIncluded = true
    }else{
      item.isIncluded = false
    }
  })
}

function setIsItemIncluded(item, areaCircles){
  if (inCircle(item, areaCircles[0]) && inCircle(item, areaCircles[1])){
    return true
  }else{
    return false
  }
}

function dragMoved(event, d) {
  d3.select(this).attr("cx", d=> {
    d.cx = event.x
    d.x = event.x
    return d.x
  }).attr("cy", d =>{
    d.cy = event.y
    d.y = event.y
    return d.y
  });
  d3.select(`#l${d.id}0`)
    .attr('x1',`${d.cx}`)
    .attr('y1',`${d.cy - 10}`)
    .attr('x2',`${d.cx}`)
    .attr('y2',`${d.cy + 10}`)

  d3.select(`#l${d.id}1`)
    .attr('x1',`${d.cx+10}`)
    .attr('y1',`${d.cy}`)
    .attr('x2',`${d.cx-10}`)
    .attr('y2',`${d.cy}`)
  filteredResData = resData.filter(item => setIsItemIncluded(item, areaCircles))
  filteredResDataPre = filteredResData.map(x=>x)
  resNameInput.value = ''
  resAddressInput.value = ''
  maxScoreInput.value = null
  minScoreInput.value = null
  render(filteredResData)
}

function dragMoveStarted (event, d) {
  d3.select(this).style('opacity', '0.5');
}

function dragMoveEnded (event, d) {
  d3.select(this).style('opacity', '0.2');
}

let dragMoveHandler = d3.drag()
  .on('drag', dragMoved)
  .on('start', dragMoveStarted)
  .on('end', dragMoveEnded)


let renderAreaCircle = (areaCircleData) => {

  const areaCircles = svg.selectAll('.areaCircle').data(areaCircleData)
    .enter().append('circle')
  
  areaCircles
    .merge(areaCircles)
    .attr('id', d => `cir${d.id}`)
    .attr('cy', d=>d.cy)
    .attr('cx', d=>d.cx)
    .attr('r', d=>d.r)
    .style('fill', d => d.color)
    .style('opacity', '0.2')
    .call(dragMoveHandler)
}

let initialRender = (dataRestaurants) => {
  const initSelection = svg.selectAll('.initCircle').data(dataRestaurants, d=>d.id)
  initSelection
    .enter().append('circle')
    .attr('cy', d=>d.Longitude)
    .attr('cx', d=>d.Latitude)
    .attr('r', 3)
    .style('fill', '#616161')
    .style('opacity', '0.5')
    .attr('class', 'initCircle')
}

let render = (dataRestaurants) =>{

  const resSelection = svg.selectAll('.dataCircle').data(dataRestaurants, d=>d.id)

  resSelection
    .enter().append('circle')
    .attr('cy', d=>d.Longitude)
    .attr('cx', d=>d.Latitude)
    .attr('r', 3)
    .attr('class', 'dataCircle')
    .attr("id", (d) => { return "data"+d.id})
    .style('fill', '#0D47A1')
    .on("mouseover", function(e,d) {
      d3.select(`#data${d.id}`)
        .attr('r',7)
        .attr('stroke', 'red')
        .attr('stroke-weight', '2')
        .style("opacity", 1)
      tooltip.transition()		
          .duration(200)		
          .style("opacity", .9);		
      tooltip.html(`Name: ${d.Name}<br/>Score: ${d.Score}`)	
        .style("left", (e.x + 10) + "px")		
        .style("top", (e.y + 10) + "px");	
    })					
    .on("mouseout", function(e,d) {	
      d3.select(`#data${d.id}`)
        .attr('r',3)
        .attr('stroke', 'None')
      tooltip.transition()		
          .duration(500)		
          .style("opacity", 0);	
    })

    resSelection.exit().remove()
}


d3.csv('./data.csv').then(data =>{
  data.forEach((element, id) => {
    let [x,y] = projection([+element.Longitude, +element.Latitude])
    element.Latitude = x
    element.Longitude = y
    element.Score = +element.Score
    element.isIncluded = true
    element.in = true
    element.id = id
  });
  renderAreaCircle(areaCircles)
  setIsInclude(data, areaCircles)
  resData = data
  initialRender(resData)
  filteredResData = resData.map(x=>x)
  render(filteredResData)
  filteredResData = resData.filter(item => setIsItemIncluded(item, areaCircles))
  render(filteredResData)
  filteredResDataPre = filteredResData.map(x=>x)
})




let radiusSlider1 = document.getElementById('radius_slider1')
radiusSlider1.max = mapBoxWidth/2
radiusSlider1.value = areaCircles[0].r
let radiusValue1 = document.getElementById('radiusValue1')
radiusValue1.innerHTML = radiusSlider1.value
radiusSlider1.addEventListener('input', ()=>{
  resNameInput.value = ''
  resAddressInput.value = ''
  maxScoreInput.value = null
  minScoreInput.value = null
  radiusValue1.innerHTML = radiusSlider1.value
  areaCircles[0].r = radiusSlider1.value
  d3.select(`#cir0`)
        .attr('r',radiusSlider1.value)
  filteredResData = resData.filter(item => setIsItemIncluded(item, areaCircles))
  render(filteredResData)
  filteredResDataPre = filteredResData.map(x=>x)
}, false)




let radiusSlider2 = document.getElementById('radius_slider2')
radiusSlider2.max = mapBoxWidth/2
radiusSlider2.value = areaCircles[1].r
let radiusValue2 = document.getElementById('radiusValue2')
radiusValue2.innerHTML = radiusSlider2.value
radiusSlider2.addEventListener('input', ()=>{
  resNameInput.value = ''
  resAddressInput.value = ''
  maxScoreInput.value = null
  minScoreInput.value = null
  radiusValue2.innerHTML = radiusSlider2.value
  areaCircles[1].r = radiusSlider2.value
  d3.select(`#cir1`)
        .attr('r',radiusSlider2.value)
  filteredResData = resData.filter(item => setIsItemIncluded(item, areaCircles))
  render(filteredResData)
  filteredResDataPre = filteredResData.map(x=>x)
}, false)


let resNameInput = document.getElementById('resName')
resNameInput.addEventListener('input', ()=>{
  filteredResData = filterData(filteredResDataPre)
  render(filteredResData)
}, false)

let resAddressInput = document.getElementById('resAddress')
resAddressInput.addEventListener('input', ()=>{
  filteredResData = filterData(filteredResDataPre)
  render(filteredResData)
}, false)

let maxScoreInput = document.getElementById('maxScore')
maxScoreInput.addEventListener('input', ()=>{
  filteredResData = filterData(filteredResDataPre)
  render(filteredResData)
}, false)

let minScoreInput = document.getElementById('minScore')
minScoreInput.addEventListener('input', ()=>{
  filteredResData = filterData(filteredResDataPre)
  render(filteredResData)
}, false)

function filterData(data){
  let filtered = data.map(x => x)
  if(resNameInput.value != null){
    filtered = filtered.filter(item => item.Name.startsWith(resNameInput.value.toUpperCase()))
  }
  if(resAddressInput.value != null){
    filtered = filtered.filter(item => item.Adress.startsWith(resAddressInput.value.toUpperCase()))
  }
  if(maxScoreInput.value != null && maxScoreInput.value != 0){
    filtered = filtered.filter(item => item.Score <= (+maxScoreInput.value))
  }
  if(minScoreInput.value != null && minScoreInput.value != 0){
    filtered = filtered.filter(item => item.Score >= (+minScoreInput.value))
  }
  return filtered
}

