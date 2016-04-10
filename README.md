# P6-1: Neighborhood Map Project
A map, list, and details of five breweries within the city of Chicago, IL.
Pulls name, coordinates, address, and website URL from www.brewerydb.com API.

Instructions:

 - Load index.html to begin.
 - Click any of the brewery names in the navigation area to jump directly to any specific brewery.
 - Click any map marker to load details of a brewery.
 - Use the search field to limit breweries on map / navigation to those which have names that match or resemble search query.
 - Use the (reset) text link in the upper left corner to reset to the original map zoom level.
 
Notes:

 - Call to brewerydb.com had to be mocked / data loaded from local file due to
   accessibility limitations of API (doesn't support CORS or JSONP).  The URL within the apiURL variable is a working URL,
   and the data for the /data.js file was obtained via this specific query.  I started with hard coded data and worked
   backward, assuming that I'd be able to connect via the URL later on.  If I'd noticed this issue earlier, I probably
   would have stayed with hard coded data and utilized a different third party API.  For reference:
   http://stackoverflow.com/questions/32429776/how-to-process-external-api-json-and-not-jsonp
