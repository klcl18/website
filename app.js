let constantsData = null;
let recommendationsData = null;

// Function to fetch and process data from 'data.json' and 'constants.json' and cacheing data
async function fetchAllData() {
  try {
    const [constantsResponse, dataResponse] = await Promise.all([
      fetch('constants.json'),
      fetch('data.json')
    ]);

    constantsData = await constantsResponse.json();
    dataData = await dataResponse.json();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Function to fetch constants from the cached data
function getConstants() {
  return constantsData;
}

// Function to fetch recommendations from the cached data
function getData() {
  return dataData;
}


//Function to fetch constants and populate pot type dropdown menu in only one FOR loop
async function populateDropdown() {
  if (!constantsData) await fetchAllData();

  const data = getConstants();
  if (!data) return;

  const potType= document.getElementById("potType");
  const plantType = document.getElementById("plantType");
  const seasonType = document.getElementById("season");

  for (let i = 0; i < data.length; i++) {
    if(data[i].datatype === "pot") {
      var option = document.createElement("option");
      option.text = data[i].name;
      option.value = data[i].name;
      potType.add(option);
    }
    else if(data[i].datatype === "species") {
      var option = document.createElement("option");
      option.text = data[i].name;
      option.value = data[i].name;
      plantType.add(option);
    }
    else if(data[i].datatype === "season") {
      var option = document.createElement("option");
      option.text = data[i].name;
      option.value = data[i].name;
      seasonType.add(option);
    }
  }
}

function initialize() { //only initializing one function instead of three
  populateDropdown()
}

function calculatePotVolume(diameter, height) {
  const radius = diameter / 2;
  return Math.PI * Math.pow(radius, 2) * height;
}

//Function to calculate water and fertilizer recommendations
async function calculateRecommendations(potVolume, potType, plantType, season) {
  if (!constantsData) await fetchAllData();

  const data = getConstants();
  if (!data) return;

  let potdata
  let speciesdata
  let seasondata

  for (let i = 0; i < data.length; i++) { //reduce the three for loops into one
    if(data[i].datatype === "pot" && data[i].name === potType) {
      potdata = data[i]
    }
    else if(data[i].datatype === "species" && data[i].name === plantType) {
      speciesdata = data[i]
    }
    else if(data[i].datatype === "season" && data[i].name === season) {
      seasondata = data[i]
    }
  } 


  let water = potVolume * 0.0001 *potdata.datafield_1*seasondata.datafield_1
  let fertilizer = water * seasondata.datafield_2

  document.getElementById('recommendedWater').textContent = `${water.toFixed(1)} liters`;
  document.getElementById('recommendedFertilizer').textContent = `${fertilizer.toFixed(2)} units`;
}

// Function to search recommendations data and calculate statistics based on it and user inputs
async function findRecommendations(potVolume, potType, plantType, season) {
  if (!dataData) await fetchAllData();

  const data = getData();
  if (!data) return;

  let similarCount = 0
  let similarwaterCount = 0
  let similarwaterGrowthSum = 0
  let similarwaterYieldSum = 0 //all counters moved together for consistency and better readability
  let lesswaterCount = 0
  let lesswaterGrowthSum = 0
  let lesswaterYieldSum = 0
  let morewaterCount = 0
  let morewaterGrowthSum = 0
  let morewaterYieldSum = 0

  for (let i = 0; i < data.length; i++) {
    if(data[i].pot_type === potType && data[i].plant_type === plantType && data[i].time_of_year === season 
      && data[i].pot_volume > (potVolume * 0.9)  && data[i].pot_volume > (potVolume * 1.1)) {
        similarCount = similarCount + 1
    }
  } 
  
  
  //combined 3 FOR loops into one
  for (let i = 0; i < data.length; i++) {
    if(data[i].pot_type === potType && data[i].plant_type === plantType && data[i].time_of_year === season 
      && data[i].pot_volume > (potVolume * 0.9)  && data[i].pot_volume > (potVolume * 1.1)
      && data[i].actual_water >  (data[i].recommended_water * 0.9) && data[i].actual_water >  (data[i].recommended_water * 1.1)) {
        similarwaterCount = similarwaterCount + 1
        similarwaterGrowthSum = similarwaterGrowthSum + data[i].growth_rate
        similarwaterYieldSum = similarwaterYieldSum + data[i].crop_yield
    }
    else if(data[i].pot_type === potType && data[i].plant_type === plantType && data[i].time_of_year === season 
      && data[i].pot_volume > (potVolume * 0.9)  && data[i].pot_volume > (potVolume * 1.1)
      && data[i].actual_water <=  (data[i].recommended_water * 0.9) ) {
        lesswaterCount = lesswaterCount + 1
        lesswaterGrowthSum = lesswaterGrowthSum + data[i].growth_rate
        lesswaterYieldSum = lesswaterYieldSum + data[i].crop_yield
    }
    else if(data[i].pot_type === potType && data[i].plant_type === plantType && data[i].time_of_year === season 
      && data[i].pot_volume > (potVolume * 0.9)  && data[i].pot_volume > (potVolume * 1.1)
      &&  data[i].actual_water >=  (data[i].recommended_water * 1.1)) {
        morewaterCount = morewaterCount + 1
        morewaterGrowthSum = morewaterGrowthSum + data[i].growth_rate
        morewaterYieldSum = morewaterYieldSum + data[i].crop_yield
    }
  } 

  document.getElementById('similar').textContent = similarCount;
  document.getElementById('similarwaterCount').textContent = similarwaterCount;
  document.getElementById('similarwaterGrowthAverage').textContent = similarwaterCount ? (similarwaterGrowthSum / similarwaterCount).toFixed(1) : "-";
  document.getElementById('similarwaterYieldAverage').textContent = similarwaterCount ? (similarwaterYieldSum / similarwaterCount).toFixed(1):"-";
  document.getElementById('lesswaterCount').textContent = lesswaterCount;
  document.getElementById('lesswaterGrowthAverage').textContent = lesswaterCount ?(lesswaterGrowthSum / lesswaterCount).toFixed(1): "-";
  document.getElementById('lesswaterYieldAverage').textContent = lesswaterCount ? (lesswaterYieldSum / lesswaterCount).toFixed(1):"-";
  document.getElementById('morewaterCount').textContent = morewaterCount;
  document.getElementById('morewaterGrowthAverage').textContent = morewaterCount ? (morewaterGrowthSum / morewaterCount).toFixed(1):"-";
  document.getElementById('morewaterYieldAverage').textContent = morewaterCount ? (morewaterYieldSum / morewaterCount).toFixed(1):"-";
  //moved for consistency and readability
  
  let outputSection = document.getElementById("outputSection");
  outputSection.style.display = "block";
}

// Event listener for the calculate button
document.getElementById('calculateButton').addEventListener('click', function() {
  const potType = document.getElementById('potType').value;
  const potDiameter = parseFloat(document.getElementById('potDiameter').value);
  const potHeight = parseFloat(document.getElementById('potHeight').value);
  const plantType = document.getElementById('plantType').value;
  const season = document.getElementById('season').value;

  // Calculate pot volume
  const potVolume = calculatePotVolume(potDiameter, potHeight);
  document.getElementById('potSize').textContent = (potVolume/1000).toFixed(1);

  calculateRecommendations(potVolume, potType, plantType, season)

  // Find and display recommendations and statistics
  findRecommendations(potVolume, potType, plantType, season);
});
