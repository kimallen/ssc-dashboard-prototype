(function(){

	var app = angular.module('dashboard', ['highcharts-ng']);
	
	app.controller("outcomeController", ['$http', outcomeController]);
    
    function outcomeController($http){
        
        var viewModel = this
        viewModel.populateCharts = populateCharts
        viewModel.chartConfigs = [];

        viewModel.demoFilter = {
            demoSelect: "ALL",
            demoOptions: [
            {value: "ALL", name: "ALL"},
            {value: "age", name: "age"}, 
            {value: "violence", name: "History of violence"},
            {value: "english", name: "English Proficiency"},
            {value: "mental", name: "Current mental health" },
            {value: "substanceAbuse", name: "Current Substance Abuse"},
            {value: "immigrationStatus", name: "Immigration Status"},
            {value: "genderId", name: "Gender identity"},
            {value: "traffickingType", name: "Type of trafficking/violence"},
            {value: "children", name: "Accompanying Children"},
            {value: "disability", name: "Physical disability"}
            ]
        }

        var outcomesData = {};
        //This function retrieves data from api, takes in the filter type, and builds small multiples charts of each of the filter's categories
        
        // outcomesDataByFilter("age")

            var apiUrl = 'http://localhost:3000/db'
            $http.get(apiUrl)
            .then(storeResponseData)
            // .then(populateDefaultChart)
        
        function storeResponseData(response){
            
            outcomesData = response.data
            populateDefaultChart()
        };

        function populateDefaultChart(){
            populateCharts("ALL")
        }

        //this function populates the charts for each category
        function populateCharts(filterType){
            console.log("filter type: " + filterType)
            viewModel.chartConfigs = [];
            var subDemographics = outcomesData[filterType]       
            // var subDemographics = response[filterType]

            //This function gets the maximum value to use for all charts in the chosen filter
            function getMaxY(){
                var maxY = 0
                var newMax = 0
                
                for (subDemographic in subDemographics){
                    var outcomes = subDemographics[subDemographic]
                    var outcomeValues = Object.keys( outcomes ).map(function ( key ) { return outcomes[key]; }); 
                    newMaxY = Math.max(...outcomeValues)
                    if (newMaxY > maxY){maxY = newMaxY}
                }
                return maxY
            }
            var maxY = getMaxY()

            // loops through each of the sub-categories within the chosen filter type
            for (subDemographic in subDemographics){
                var outcomes = subDemographics[subDemographic]
                
                var chartConfig = getChartConfig(subDemographic, outcomes)
                viewModel.chartConfigs.push(chartConfig);
            } //closes FOR loop

            
            //Builds config info for a single chart
                function getChartConfig(subDemographic, outcomes){ 

                    var chartConfig = {
                            id: "chart-" + subDemographic,
                            options: {
                      
                                chart: {
                                      type: 'column'
                                },
                                title: {
                                    text: 'Request Outcomes by ' + subDemographic
                                },
                                  tooltip: {
                                    headerFormat: '<b>{point.x}</b><br/>',
                                    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                                },
                                xAxis: {
                                    categories: ['Success', 'Not Placed/Other']
                                },
                                yAxis: {
                                    min: 0,
                                    max: maxY, //create a loop to adjust based on max value in data
                                    title: {
                                        text: 'Total requests'
                                    },
                                    stackLabels: {
                                        enabled: true,
                                        style: {
                                            fontWeight: 'bold',
                                            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                                        }
                                    }
                                },
                                legend: {
                                    align: 'right',
                                    x: -30,
                                    verticalAlign: 'top',
                                    y: 25,
                                    floating: true,
                                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                                    borderColor: '#CCC',
                                    borderWidth: 1,
                                    shadow: false
                                },
                                plotOptions: {
                                    column: {
                                        stacking: 'normal',
                                        dataLabels: {
                                            enabled: true,
                                            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                                            style: {
                                                textShadow: '0 0 3px black'
                                            }
                                        }
                                    }
                                }
                                
                              },
                              
                          series: [{
                                name: "Placed",
                                data: [[0, outcomes["placement"]]]
                                // data: [outcomes["placement"], outcomes["no placement"] ]
                            },
                            {
                                name: "Referred",
                                // data: [5, 4]
                                data: [[0, outcomes["referred"]]]
                            },
                             {
                                name: 'Not placed',
                                // data: [2, 7]
                                data: [[1, outcomes["referred"]]]
                            },
                            {
                                name: 'Other',
                                data: [[1, outcomes["Other"]]]
                            }
                             ],
                            

                          loading: false,
                          
                          useHighStocks: false,
                          
                          
                          //function (optional)
                          func: function (chart) {
                           //setup some logic for the chart
                          }
                        
                    };//closes chartConfig object
                    return chartConfig
                                      
                };//closes getChartConfig                            
        }; //closes populateCharts
    }; //closes outcomeController	
})();//closes document ready