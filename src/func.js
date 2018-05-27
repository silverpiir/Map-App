document.getElementById('mapid').style.cursor = 'pointer'

var newMarker,
		markerDict = {},
		markerSwitch = true,
		dictKey = 1,
		tableRowId = 1,
		coordCellId = 1,
		row;

//Declare different colored markers
var greenIcon = new L.Icon({
	iconUrl: 'img/marker-icon-green.png',
	shadowUrl: 'img/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var redIcon = new L.Icon({
	iconUrl: 'img/marker-icon-red.png',
	shadowUrl: 'img/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

var yellowIcon = new L.Icon({
	iconUrl: 'img/marker-icon-yellow.png',
	shadowUrl: 'img/marker-shadow.png',
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41]
});

//Map initialization
var mymap = L.map('mapid').setView([58.38042, 26.72413], 15);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZG9vbW9sb2MiLCJhIjoiY2pnM2RxODdlMDc4bDJ3bG9zZWFhdmxoeCJ9.3rLOJosCxtZ0k-eNSuGrKA', {
  maxZoom: 20,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' + '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' + 'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'mapbox.streets' })
  .addTo(mymap);

//Creation of new markers and behaviour on marker dragging
function onMapClick(e) {
  if(document.getElementById('setmarker').disabled === true && markerSwitch === true) { //Switch

    newMarker = new L.marker(e.latlng, {icon: yellowIcon, id: dictKey, draggable: true}); //Declare marker properties
    document.getElementById('coordinates').value = (e.latlng.lat.toString() + ', ' + e.latlng.lng.toString()); //"Koordinaadid" textarea value

		//Behaviour on marker dragging
    newMarker.on('dragend', function(event){
      var newMarker = event.target;
      var position = newMarker.getLatLng();
      newMarker.setLatLng(position, {icon: greenIcon, draggable: true});
			//Change the displayed value in the coordinates textarea
      document.getElementById('coordinates').value = position.lat.toString() + ', ' + position.lng.toString();
			//Change the coordinates value in the marker table
			//If newly created and unsaved marker is dragged, do not attempt to change value in markertable
			if (document.getElementById(newMarker.options.id) === null) {
				//continue
			} else {
				document.getElementById(newMarker.options.id).innerHTML = position.lat.toString() + ', ' + position.lng.toString();
			}

			markerDict[newMarker.options.id] = newMarker;
			distanceCalc();
			nearestCalc();
    });

		//Add new marker to the map
    mymap.addLayer(newMarker);
		newMarker.setIcon(yellowIcon);
		markerDict[dictKey] = newMarker;
		/*If distanceCalc(); is commented out: don't determine if marker is too near
		 to others before clicking "Salvesta". This is a matter of preference.*/
		//distanceCalc();
		dictKey++;
    markerSwitch = false;
  }
}
mymap.on('click', onMapClick);

//Function for the back-to-top button
function topFunction() {
  document.body.scrollTop = 0; // Safari
  document.documentElement.scrollTop = 0; // Chrome, Firefox, IE and Opera
}

//Trim function, helps checking textarea value
String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g,"");
}

//Marker color assignment function. Calculates distances between markers and assigns icons
function distanceCalc() {
	var redList = [];
	var greenList = [];
	//assigns marker objects to redList and greenList, with overlapping values
	for (var [key, marker] of Object.entries(markerDict)) {
		for (var [key2, marker2] of Object.entries(markerDict)) {
			if (markerDict[key] != markerDict[key2]) {
				if (markerDict[key].getLatLng().distanceTo(markerDict[key2].getLatLng()) < 500) {
					redList.push(markerDict[key]);
					redList.push(markerDict[key2]);
				} else if (markerDict[key].getLatLng().distanceTo(markerDict[key2].getLatLng()) >= 500) {
					greenList.push(markerDict[key]);
					greenList.push(markerDict[key2]);
				}
			}
		}
	}

	if (greenList.length != 0) { //If greenList isn't empty, decide what to do with objects therein
		for (i = 0; i < greenList.length; i++) {
			if (redList.includes(greenList[i])) { //If there is overlap with redList, the object will receive the redIcon
				greenList[i].setIcon(redIcon);
			} else {
				greenList[i].setIcon(greenIcon);
			}
		}
	}

	if (redList.length != 0) { //Every object in redList sets its icon to redIcon
		for (i = 0; i < redList.length; i++) {
			redList[i].setIcon(redIcon);
		}
	}
}

//Function for calculating the nearest marker's distance for all markers on the map
function nearestCalc() {
	var table = document.getElementById("markertable");
	//Compare each marker to other markers if there are two or more markers
	if (Object.keys(markerDict).length > 1) {
		for (var [key, marker] of Object.entries(markerDict)) {
			var distList = []; //Helper array for selecting lowest distance
			var smallest = 50000000; //Initialized with 50 000 km (more than max distance between two points on Earth)
			var nearestMarker;
			for (var [key2, marker2] of Object.entries(markerDict)) {
				if (markerDict[key] != markerDict[key2]) {
					var dist = markerDict[key].getLatLng().distanceTo(markerDict[key2].getLatLng());
					distList.push(dist); //All distances between markers to helper array
					if (dist < smallest) {
						var smallest = dist;
						nearestMarker = key2;
					}
				}
			}

			var minDist = Math.min(...distList); //Find the minimum value
			 //current marker's coordinate string
			var locationString = markerDict[key].getLatLng().lat.toString()
													+ ', '
													+ markerDict[key].getLatLng().lng.toString();
			//nearest marker's coordinate string
			var neighbourString = markerDict[nearestMarker].getLatLng().lat.toString()
													+ ', '
													+ markerDict[nearestMarker].getLatLng().lng.toString();
			var neighbourName;
			//Find nearest neighbour's name
			for (var r = 1, i = table.rows.length; r < i; r++) {
				for (var c = 0, j = table.rows[r].cells.length; c < j; c++) {
					if (table.rows[r].cells[c].innerHTML == neighbourString) {
						neighbourName = table.rows[r].cells[1].innerText;
					}
				}
			}
			//Write distance and neighbourName to correct row
			for (var r = 1, i = table.rows.length; r < i; r++) {
        for (var c = 0, j = table.rows[r].cells.length; c < j; c++) {
					if(table.rows[r].cells[c].innerHTML == locationString) {
						table.rows[r].cells[4].innerHTML = neighbourName + " / " + minDist.toFixed(0) + "m"; //Removes decimals. toFixed(N) leaves N decimals in place.
					}
        }
	    }
		}
	}
}

//When "Märgi kaardile" is clicked, "Salvesta" and "Katkesta" become clickable
function ready(e) {
  document.getElementById('setmarker').disabled = true;
	document.getElementById('save').disabled = false;
	document.getElementById('cancel').disabled = false;
}

//Behaviour when "Salvesta" is clicked
function save(e) {
	if (markerSwitch === false && document.getElementById("name").value.trim() !== '') {
		//Inserts a new row and cells to the markertable and assigns values to cells
	  var table = document.getElementById("markertable");
	  row = table.insertRow(-1);
	  var cell1 = row.insertCell(0);
	  var cell2 = row.insertCell(1);
	  var cell3 = row.insertCell(2);
		var cell4 = row.insertCell(3);
		var cell5 = row.insertCell(4);
		var cell6 = row.insertCell(5);
		cell1.innerHTML = tableRowId;
	  cell2.innerHTML = '<div class="brk" style="word-break:break-all;">' + document.getElementById("name").value + '</div>';
	  cell3.innerHTML = '<div class="brk" style="word-break:break-all;">' + document.getElementById("desc").value + '</div>';
	  cell4.innerHTML = document.getElementById('coordinates').value;
		cell6.innerHTML = '<button class="btn btn-danger deletebutton" onclick="deleteRow(this)">Kustuta</button>';
		cell4.id = coordCellId;

		//Marker gets popup text from "name" and "desc" textareas
		newMarker.bindPopup("Nimi: " + document.getElementById("name").value.toString()
											+ "<br>Kirjeldus: " + document.getElementById("desc").value.toString());

		//Function for opening corresponding marker popup upon clicking table row
		row.addEventListener('click', function() {
			markerDict[cell4.id].openPopup();
		}, false);

		//Clear textfields
	  document.getElementById("name").value = '';
	  document.getElementById("desc").value = '';

		//Set button states
	  document.getElementById('setmarker').disabled = false;
		document.getElementById('save').disabled = true;
		document.getElementById('cancel').disabled = true;

		if (tableRowId === 1) { //First marker icon color to green
			markerDict[coordCellId].setIcon(greenIcon);
		}

		markerDict[coordCellId].setIcon(greenIcon);
		tableRowId++;
		coordCellId++;
		distanceCalc();
		nearestCalc();
	  markerSwitch = true;

	} else if(document.getElementById("name").value.trim() == '') { //If "Nimi" is empty
		alert("Unustasid markerile nime määrata!");
	} else { //Marker hasn't been set on the map
		alert("Unustasid markeri kaardile märkida!");
	}
}

/*
*	Behaviour when "Katkesta" is clicked, clears textfields and disables "Salvesta"
*	& "Katkesta", enables "Märgi kaardile" and deletes last marker if it was
*	marked on the map.
*/
function cancel(e){
  document.getElementById('setmarker').disabled = false;
	document.getElementById('save').disabled = true;
	document.getElementById('cancel').disabled = true;
  document.getElementById('coordinates').value = '';
	document.getElementById("name").value = '';
  document.getElementById("desc").value = '';

	//If the switch is set to false the last marker will not be removed if changes were saved
	//Otherwise one could click "Märgi kaardile" and immediately click "Katkesta" and the last marker would be deleted
	if(markerSwitch === false){
		mymap.removeLayer(newMarker);
		delete markerDict[newMarker.options.id];
		coordCellId++; //If marker was added then dictKey was incremented and coordCellId must catch up to the correct value
		nearestCalc();
	}
  markerSwitch = true;
}

//"Kustuta" button functionality
function deleteRow(r) {
	var i = r.parentNode.parentNode.rowIndex;
	document.getElementById("markertable").deleteRow(i);
	mymap.removeLayer(markerDict[r.parentNode.parentNode.cells[3].id]); //removes marker
	delete markerDict[r.parentNode.parentNode.cells[3].id]; //removes marker object from markerDict
	nearestCalc();
}
