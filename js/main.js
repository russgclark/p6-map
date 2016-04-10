/* Establish markers observableArray, maps data options from json to appropriate fields within object */
var markers = ko.observableArray([]);

function mapBreweryLocations(data) {
  return $.each(data.data, function(index, item){
    markers.push({
      navItem: "brewery" + index,
      isVisible: ko.observable(true),
      isFlag: true,
      name: item.brewery.name,
      navName: item.brewery.name.replace(/Brewing|Beer|Company|Brewery|&|Pub/g,''),
      lat: item.latitude,
      lng: item.longitude,
      street: item.streetAddress,
      city: item.locality,
      state: item.region.substring(0, 2).toUpperCase(),
      zip: item.postalCode,
      web: item.website
    });
  });
}

/* Requests and returns data from API (request is mocked due to accessibility limitations of API)
    http://stackoverflow.com/questions/32429776/how-to-process-external-api-json-and-not-jsonp
    I probably should have researched this API more prior to tying my project to it */
function loadBreweryLocations() {
  var apiUrl = 'http://api.brewerydb.com/v2/locations?ids=Kd6WH6,xjjDoA,wbpj5b,yolHh5,R2I4D5&key=f784656d4d94381b8766d3aef79f3ad3';
  apiUrl = 'js/api/data.js';
  return $.ajax({
    url: apiUrl,
    dataType: 'json',
    type: 'GET'
      }).then(function(data) {
        //console.log(data);
          return data;
        }).fail(function(data) {
          alert("Data cannot be loaded from brewerydb.com, please try again later.");
        })
}

/* Sets Google Map display options (zoom level, location for center of map), and establishes new Google Map instance */
function initMap() {
    var chicago = new google.maps.LatLng(41.956230, -87.668544);
    var mapOptions = {
        zoom: 12,
        center: chicago
    };
    if($(window).width() <= 1000) {
        mapOptions.zoom = 11;
    }
    map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

/* Loads json data into markers array, calls functions to build each brewery instance and checks marker display status */
    loadBreweryLocations().then(function(data) {
      mapBreweryLocations(data);
      buildBreweries(markers());
      checkMarkers();
    });

/* Resets zoom level and map center point, on click or in response to re-sizing of browser window width */
    function reset() {
        var browserWidth = $(window).width();
        if(browserWidth <= 1000) {
            map.setCenter(mapOptions.center);
            map.setZoom(11);
        } else if(browserWidth > 1000) {
            map.setCenter(mapOptions.center);
            map.setZoom(12);
        }
    }
    $("#reset").click(function() {
        reset();
    });
    $(window).resize(function() {
        reset();
    });
}

function googleError(){
      alert("Google Map cannot be loaded, please try again later.");
}

/* Checks markers visibility status, and adds markers to map if true */
function checkMarkers() {
  for (var i = 0; i < markers().length; i++) {
    if(markers()[i].isFlag === true) {
      markers()[i].current.setVisible(true);
    }
    else {
      markers()[i].current.setVisible(false);
    }
  }
}

/* Builds each marker/brewery location, adds each brewery to map, and sets of brewery details to InfoWindows */
function buildBreweries(brewery) {
    for (var i = 0; i < brewery.length; i++) {
        brewery[i].current = new google.maps.Marker({
          position: new google.maps.LatLng(brewery[i].lat, brewery[i].lng),
					animation: google.maps.Animation.DROP,
          map: map,
          name: brewery[i].name,
        });

        brewery[i].breweryDetails = '<h4>' + brewery[i].name + '</h4>' +
        '<p>' + brewery[i].street + '<br>' + brewery[i].city + ", " +  brewery[i].state + " " + brewery[i].zip + '<br></p>' +
        '<p><a href="' + brewery[i].web + '" target="_blank">' + brewery[i].web + '</a></p>';

        var displayDetails = new google.maps.InfoWindow({
            content: markers()[i].breweryDetails
        });

/* Opens InfoWindow when related marker is clicked, causes marker bounce animation, zooms in and centers map on related marker */
        new google.maps.event.addListener(brewery[i].current, 'click', (function(marker, i) {
          return function() {
            displayDetails.setContent(brewery[i].breweryDetails);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){ marker.setAnimation(null); }, 2200);
            displayDetails.open(map,this);
            var browserWidth = $(window).width();
              if(browserWidth <= 1000) {
                  map.setZoom(11);
              }
              else if(browserWidth > 1000) {
                  map.setZoom(17);
              }
            map.setCenter(marker.getPosition());
          };
        })(brewery[i].current, i));

/* When navigation item is clicked, opens InfoWindow of related marker, causes marker bounce animation, and zooms in and centers map on related marker */
        var navItemSearch = $('#brewery' + i);
        navItemSearch.click((function(marker, i) {
          return function() {
            displayDetails.setContent(brewery[i].breweryDetails);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){ marker.setAnimation(null); }, 2200);
            displayDetails.open(map,marker);
            map.setCenter(marker.getPosition());
            map.setZoom(15);
          };
        })(brewery[i].current, i));
    }
}

/* Checks contents of search field and compares to letters within navName (truncated brewery name),
   displays markers and navigation items upon match, hides markers which did not result in a letter match  */
var viewModel = {
    query: ko.observable(''),
};

viewModel.markers = ko.dependentObservable(function() {
    var self = this;
    var search = self.query().toLowerCase();
    return ko.utils.arrayFilter(markers(), function(marker) {
      if (marker.navName.toLowerCase().indexOf(search) >= 0) {
              marker.isFlag = true;
              return marker.isVisible(true);
          }
      else {
              marker.isFlag = false;
              checkMarkers();
              return marker.isVisible(false);
          }
    });
}, viewModel);

viewModel.query.subscribe(checkMarkers);

ko.applyBindings(viewModel);
