angular.module('hupnvs2')

// .constant('OpenWeatherConfig', {
//    	searchUrlWeather: 'http://api.openweathermap.org/data/2.5/weather?q=',
// 	searchUrlForecast: 'http://api.openweathermap.org/data/2.5/forecast?q=',
//    	units: '&units=metric',
//    	appid: '&appid=7b6f4a926199cd7535e1463e1f53d16f',
//    	imgUrl: 'http://openweathermap.org/img/w/' 
// })

.constant('WpConfig', {
	WpUrl : 'http://185.13.39.179/hupnvs-bo/',
	WpBaseUrl : 'http://185.13.39.179/hupnvs-bo/wp-json/wp/v2/',
   	WpUrlPosts: 'posts',
   	WpUrlPages: 'pages',
   	WpUrlCat: 'categories',
   	WpExcludedCats : '1',
   	WpMenuId: 37,
   	WpPageConfig: 1123 
})

.constant('NetworkSettings',{
	TimeOut : 6000
})