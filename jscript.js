$(document).ready(function(){
	$('.page-link').on('click', function(){
		$('.active').removeClass('active');
		$('#'+$(this).attr('data-link')+'-page').addClass('active');
	});	
});


// Based on an example:
//https://github.com/don/cordova-plugin-ble-central


// ASCII only
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

// this is ble hm-10 UART service
/*var blue= {
    serviceUUID: "0000FFE0-0000-1000-8000-00805F9B34FB",
    characteristicUUID: "0000FFE1-0000-1000-8000-00805F9B34FB"
};*/

//the bluefruit UART Service
var blue ={
	serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
}
// oprettter 2 variabler vi kan arbejde med, henter værdier ind hvis de findes i localstorage allerede, ellers opretter vi standard værdier. 
var sit = localStorage.getItem('sitting') == null ? '60' : localStorage.getItem('sitting');
var stand = localStorage.getItem('standing') == null ? '120' : localStorage.getItem('standing');
var ConnDeviceId;
var deviceList =[];
boolean condition = true;

//sætter variablen til at hente newHeight div feltet så vi kan tjekke den
var newHeightElem = document.getElementById('newHeight');

//tjekker om den har en værdi, ellers indsætter den vores siddende værdi
if(newHeightElem != null && condition == true){
	newHeight.innerHTML = sit;
}
else if (newHeightElem != null && condition == false) {
	newHeight.innerHTML = stand;
}

//vi opretter en variabel så vi kan tjekke på messagefeltet
var messageInput2Elem = document.getElementById('messageInput2');

//Tjekker om der en værdi allerede i feltet, og hvis ikke så sætter den vores nuværende siddende højde
if(messageInput2Elem != null){
	messageInput2Elem.value = sit;
}

var messageInput3Elem = document.getElementById('messageInput3');

if(messageInput3Elem != null){
	messageInput3Elem.value = stand;
}


function onLoad(){
	document.addEventListener('deviceready', onDeviceReady, false);
    bleDeviceList.addEventListener('touchstart', conn, false); // assume not scrolling
}

function onDeviceReady(){
	refreshDeviceList();
}

	 
function refreshDeviceList(){
	//deviceList =[];
	document.getElementById("bleDeviceList").innerHTML = ''; // empties the list
	if (cordova.platformId === 'android') { // Android filtering is broken
		ble.scan([], 5, onDiscoverDevice, onError);
	} else {
		//alert("Disconnected");
		ble.scan([blue.serviceUUID], 5, onDiscoverDevice, onError);
	}
}


function onDiscoverDevice(device){
	//Make a list in html and show devises
		if(device.name == "Bord 4") {
		var listItem = document.createElement('li'),
		html = device.name+ "," + device.id;
		listItem.innerHTML = html;
		document.getElementById("bleDeviceList").appendChild(listItem);
		}
}


function conn(){
	var  deviceTouch= event.srcElement.innerHTML;
	document.getElementById("debugDiv").innerHTML =""; // empty debugDiv
	var deviceTouchArr = deviceTouch.split(",");
	ConnDeviceId = deviceTouchArr[1];
	document.getElementById("debugDiv").innerHTML += "<br>"+deviceTouchArr[0]+"<br>"+deviceTouchArr[1]; //for debug:
	ble.connect(ConnDeviceId, onConnect, onConnError);
 }
 
 //succes
function onConnect(){
	var connData = stringToBytes(sit);
	document.getElementById("statusDiv").innerHTML = " Status: Connected";
	document.getElementById("bleId").innerHTML = ConnDeviceId;
	ble.startNotification(ConnDeviceId, blue.serviceUUID, blue.rxCharacteristic, onData, onError);
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, connData, onSend, onError);
}

//failure
function onConnError(){
	alert("Problem connecting");
	document.getElementById("statusDiv").innerHTML = " Status: Disconnected";
}

 function onData(data){ // data received from Arduino
	document.getElementById("receiveDiv").innerHTML =  "Received: " + bytesToString(data) + "<br/>";
}

function data(txt){
	messageInput.value = txt;
}	

function sendData() { // send data to Arduino
	 var data = stringToBytes(messageInput.value);
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, data, onSend, onError);
}
	
function onSend(){
}

function disconnect() {
	ble.disconnect(deviceId, onDisconnect, onError);
}

function onDisconnect(){
	document.getElementById("statusDiv").innerHTML = "Status: Disconnected";
}
function onError(reason)  {
	alert("ERROR: " + reason); // real apps should use notification.alert
}

function saveSettings() {
	sit = document.getElementById('messageInput2').value;
	stand = document.getElementById('messageInput3').value;
	if(sit < 60 || stand < 60) {
		document.getElementById("saved").innerHTML = "Value too low (Between 60 - 120)";
	}
	else if (sit > 120 || stand > 120) {
		document.getElementById("saved").innerHTML = "Value too high (Between 60 - 120)";
	}
	else {
	localStorage.setItem('sitting', sit);
	localStorage.setItem('standing', stand);
	
	document.getElementById("saved").innerHTML = "Saved settings";
	}
}

function incHeight() {
	sit++;
	var plusData = stringToBytes(sit);
	document.getElementById("newHeight").innerHTML = sit;
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, plusData, onSend, onError);
}


function decHeight() {
	sit--;
	var minusData = stringToBytes(sit);
	document.getElementById("newHeight").innerHTML = sit;
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, minusData, onSend, onError);
}

function sendStand() {
	var sendData = stringToBytes(stand);
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, sendData, onSend, onError);
	condition = false;
}

function sendSit() {
	var sendData = stringToBytes(sit);
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, sendData, onSend, onError);
	condition = true;
}
