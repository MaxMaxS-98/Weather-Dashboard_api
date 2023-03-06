// global variables
var city="";
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#selected-city");
var currentTemperature = $("#temperature");
var currentHumidty= $("#humidity");
var currentWSpeed=$("#wind-speed");
var currentUvindex= $("#uv-index");
var citySearch=[];

// search button event listener
function find(c){
    for (var i=0; i<citySearch.length; i++){
        if(c.toUpperCase()===citySearch[i]){
            return -1;
        }
    }
    return 1;
}
//my personal API key
var APIKey="6574007f5c9dbb272db9cf1f72626ada";
//this will display the current and future weather
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}
//this will build the url for the current weather
function currentWeather(city){
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        // The date format method is taken from the  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date=new Date(response.dt*1000).toLocaleDateString();
// this will display the city name, the date and the weather icon on the page
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");
        // Display the Temperature in Fahrenheit
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
        // this is to display the humidity
        $(currentHumidty).html(response.main.humidity+"%");
       // to display the wind speed
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(currentWSpeed).html(windsmph+"MPH");
        // to display the UV index
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            citySearch=JSON.parse(localStorage.getItem("cityname"));
            console.log(citySearch);
            if (citySearch==null){
                citySearch=[];
                citySearch.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(citySearch));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    citySearch.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(citySearch));
                    addToList(city);
                }
            }
        }

    });
}

function UVIndex(ln,lt){
    //the url for uvindex.
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currentUvindex).html(response.value);
            });
}
    
// this will display actuall 5 day forecast for the selected city
function forecast(cityid){
    var dayover = false;
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconurl+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        }
        
    });
}

//this will add the past search to the page using local storage
function addToList(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}
//this will display the past search
function PastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}
// this will load the last city searched
function loadlastCity(){
    $("ul").empty();
    var citySearch = JSON.parse(localStorage.getItem("cityname"));
    if(citySearch!==null){
        citySearch=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<citySearch.length;i++){
            addToList(citySearch[i]);
        }
        city=citySearch[i-1];
        currentWeather(city);
    }

}
// this will clear the history
function clearHistory(event){
    event.preventDefault();
    citySearch=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
// this will call the functions
$("#search-button").on("click",displayWeather);
$(document).on("click",PastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);