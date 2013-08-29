//posição inicial do mapa
var def_center_latitude = -23.551476999689513;
var def_center_longitude = -46.72525364575381;
var def_zoom = 12;

//variaveis para guardar a posição do mapa quando a orientação da tela é alterada
var center_latitude = null;
var center_longitude = null;
var zoom = null;
var map_type = null;

var google_map;


// appMobi
var onDeviceReady=function(){
	console.log("onDeviceReady");
	AppMobi.device.setRotateOrientation("portrait");
    AppMobi.device.setAutoRotate(false);	
};
document.addEventListener("appMobi.device.ready",onDeviceReady,false);


$(document).on('pageshow', '#map_page', function(e, data) {
	
	// mostrar mensagem de carregando.
	$.mobile.loading("show",{
		text: "Carregando mapa...",
		textVisible: true	
		});
	$('#map_canvas').css('height', getRealContentHeight());
	
	carregarMapa();

	
	// script para carregar os pontos do google drive.
	/*
	var DATA_DRIVE_URL = "https://script.google.com/macros/s/AKfycbzKqbooUVVho1MLxfX5mFc_2_BwGk3kwj8D-UK2A2COAFU3Lns/exec?jsonp=load_data"
	var scriptElement = document.createElement('script');
	scriptElement.src = DATA_DRIVE_URL;
	document.getElementsByTagName('head')[0].appendChild(scriptElement);
	*/
	
	console.log('Ajax para pegar dados do Google Drive');	
	var DATA_DRIVE_URL = "https://script.google.com/macros/s/AKfycbzKqbooUVVho1MLxfX5mFc_2_BwGk3kwj8D-UK2A2COAFU3Lns/exec";
	$.ajax(DATA_DRIVE_URL,{
		dataType : 'json',
		success : function(data){
			load_data(data);
			console.log('Success!');
			$('#error_message').text('SUCESSO');
		},
		error: function(jqXHR, status, error){
			$.mobile.loading("hide");
			console.log(status + ' : ' + error);
			$('#error_message').text(status + ' : ' + error);
			$('#dialogo').popup('open');
		}
	});
	
});

function load_data(data){
	console.log('load_data:');
	console.log(data);
	
	for(var i=1;i<data.length;i++){
			
		var marker = new google.maps.Marker({
			title: data[i][1],
			position: new google.maps.LatLng(data[i][2],data[i][3]),
			icon: data[i][4],
			map: google_map
		});
	}
	
	$.mobile.loading("hide");
}


$(document).on('pageshow', function(e) {
	if($.mobile.activePage.attr('id') != 'map_page'){
		center_latitude = null;
		center_longitude = null;
		zoom = null;
		map_type = null;
	}
});

$(window).on( "orientationchange", function( event ) {

	if($.mobile.activePage.attr('id') == 'map_page'){
		var c = google_map.getCenter();
		center_latitude = c.lat();
		center_longitude = c.lng();
		zoom = google_map.getZoom();
		console.log('Center Lat : ' + center_latitude);
		console.log('Center Lgn : ' + center_longitude);
		console.log('Zoom : ' + zoom);
		map_type = google_map.getMapTypeId();
		$.mobile.changePage('#map_page',{allowSamePageTransition : true, changeHash: false, transition: 'fade'});
	}
});


function carregarMapa(){
	console.log('Carregando mapa');

	google_map = new google.maps.Map(document.getElementById('map_canvas'), {
		zoom : zoom != null ? zoom : def_zoom,
		center : new google.maps.LatLng(center_latitude != null ? center_latitude : def_center_latitude , center_longitude != null ? center_longitude : def_center_longitude),
		mapTypeId : map_type != null ? map_type : google.maps.MapTypeId.ROADMAP
	});
}

function getRealContentHeight() {
	var header = $.mobile.activePage.find("div[data-role='header']:visible");
	var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
	var content = $.mobile.activePage.find("div[data-role='content']:visible");
	
	var viewport_height;
	var cheight;
	var coheight;
	
		viewport_height = $(window).height();
		cheight = content.height();
		coheight = content.outerHeight();	

	var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
	if ((coheight - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
		content_height -= (coheight - cheight);
	}
	return content_height;
}