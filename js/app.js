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
var updates_counter = 0;

//é chamada antes da pagina carregar.
getMetadataOnline();

function getMetadataOnline(){
	console.log('getMetadataOnline');
	$.ajax({
		type: 'GET',
		dataType : 'json',
		url: 'https://script.google.com/macros/s/AKfycbyFxDH37YzSCmx_QgBT3mQ8QPqKXX91Tj2XMgxCbkfaX6OgfDcJ/exec',
		beforeSend: function(){
			//startLoadingMessage("Verificando versão...");
		},
		error: function(jqxhr,status,error){
			//stopLoadingMessage();
			//errorMessage(status+' : '+error);
		},
		success: function(data,status){
			//stopLoadingMessage();
			//errorMessage(status+' : '+data);
			checkMetadata(data);
		}		
	});
}

function checkMetadata(metadataOnline){
	console.log('checkMetaData');
	console.log('online : ' + JSON.stringify(metadataOnline));
	var metadata;
	if(localStorage.getItem("Metadata")){
		metadata = JSON.parse(localStorage.getItem("Metadata"));		
	}else{
		metadata = new Object;
		metadata.IconsVersion = 0;
		metadata.MapVersion = 0;
		localStorage.setItem("Metadata",JSON.stringify(metadata));
	}
	console.log('device : ' + JSON.stringify(metadata));
	
	var actualMetada = metadataOnline;
	upUpdates();
	if(metadata.IconsVersion != actualMetada.IconsVersion || !localStorage.getItem("Icones")){
		loadIconsData();
		metadata.IconsVersion = actualMetada.IconsVersion;
		localStorage.setItem("Metadata",JSON.stringify(metadata));
		console.log('new : ' + JSON.stringify(metadata));
		upUpdates();
	}
	if(metadata.MapVersion != actualMetada.MapVersion || !localStorage.getItem("PontosMapa")){
		loadMapData();
		metadata.MapVersion = actualMetada.MapVersion;
		localStorage.setItem("Metadata",JSON.stringify(metadata));
		console.log('new : ' + JSON.stringify(metadata));
		upUpdates();
	}
	downUpdates();
}

function upUpdates(){
	updates_counter++;
	console.log('upUpdates: '+ updates_counter);
}

function downUpdates(){
	updates_counter--;
	console.log('downUpdates: '+ updates_counter);
	if(updates_counter == 0){
		plotMapData();
	}
}

function loadIconsData(){
	console.log('loadIconsData');
	var url = 'https://script.google.com/macros/s/AKfycbxvbOD2urgp865hZFZbjcCYCfMvWLNcSBkcoGgYzupGo1hlsw8/exec?get=icones'; // parametro final comoo icones
	$.ajax({
		type: 'GET',
		dataType : 'json',
		url: url,
		beforeSend: function(){
			startLoadingMessage("Atualizando icones...");
		},
		error: function(jqxhr,status,error){
			stopLoadingMessage();
			errorMessage(status+' : '+error);
		},
		success: function(data,status){
			stopLoadingMessage();
			callbackLoadIconsData(data);
		}		
	});	
}

function callbackLoadIconsData(data){
	console.log('callbackLoadIconsData');
	var icones = new Array;	
	for(var i=0;i<data.length;i++){
		icones[data[i][0]] = data[i][1];
	}
	console.log(icones);
	localStorage.setItem("Icones",JSON.stringify(icones));
	downUpdates();
}

function loadMapData(){
	console.log('loadMapData');
	var url = 'https://script.google.com/macros/s/AKfycbxvbOD2urgp865hZFZbjcCYCfMvWLNcSBkcoGgYzupGo1hlsw8/exec?get=pontos'; // parametro final comoo pontos
	$.ajax({
		type: 'GET',
		dataType : 'json',
		url: url,
		beforeSend: function(){
			startLoadingMessage("Atualizando dados...");
		},
		error: function(jqxhr,status,error){
			stopLoadingMessage();
			errorMessage(status+' : '+error);
		},
		success: function(data,status){
			stopLoadingMessage();
			callbackLoadMapData(data);
		}		
	});	
}

function callbackLoadMapData(data){
	console.log('callbackLoadMapData');
	var mapa = new Array;	
	for(var i=0;i<data.length;i++){
		mapa[data[i][0]] = data[i].slice(1);
	}
	console.log(mapa);
	localStorage.setItem("PontosMapa",JSON.stringify(mapa));
	downUpdates();
}

function startLoadingMessage(text){
	// mostrar mensagem de carregando.
	$.mobile.loading("show",{
		text: text,
		textVisible: true	
	});
}

function stopLoadingMessage(){
	$.mobile.loading("hide");
}

function errorMessage(message){
	console.log('errorMessage : ' + message);
	$('#error_message').text(message);
	$('#dialogo').popup('open');
}


function plotMapData(){
	console.log('plotMapData');
	var pontos = JSON.parse(localStorage.getItem("PontosMapa"));
	var icones = JSON.parse(localStorage.getItem("Icones"));
	console.log(pontos);
	console.log(icones);
	
	var icone;
	for(var i=0;i<pontos.length;i++){
		icone = icones[pontos[i][0]]; 
		var marker = new google.maps.Marker({
			title: pontos[i][1],
			position: new google.maps.LatLng(parseFloat(pontos[i][3]),parseFloat(pontos[i][4])),
			icon: {url: icone, scaledSize: new google.maps.Size(80,80)},
			map: google_map
		});
		console.log(marker);
	}
	console.log('end of plotMapData');
}

$(document).on('pageshow', '#map_page', function(e, data) {
	
	
	
	//startLoadingMessage("Carregando mapa...");
			
	$('#map_canvas').css('height', getRealContentHeight());
	criarMapa();

	
	// script para carregar os pontos do google drive.
	/*
	var DATA_DRIVE_URL = "https://script.google.com/macros/s/AKfycbzKqbooUVVho1MLxfX5mFc_2_BwGk3kwj8D-UK2A2COAFU3Lns/exec?jsonp=load_data"
	var scriptElement = document.createElement('script');
	scriptElement.src = DATA_DRIVE_URL;
	document.getElementsByTagName('head')[0].appendChild(scriptElement);
	*/
	
	/*
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
			errorMessage(status + ' : ' + error);
		}
	});
	*/
});


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


function criarMapa(){
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