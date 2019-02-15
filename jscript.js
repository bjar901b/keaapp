//Creating Jquery to be able to switch between pages in a single page design
$(document).ready(function(){
	$('.page-link').on('click', function(){
		$('.active').removeClass('active');
		$('#'+$(this).attr('data-link')+'-page').addClass('active');
	});
});

var sitting = true;

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
// Creates 2 variables we can work with, gets values from localstorage, if they exist already, otherwise we will make standard values 
var sit = localStorage.getItem('sitting') == null ? '60' : localStorage.getItem('sitting');
var stand = localStorage.getItem('standing') == null ? '120' : localStorage.getItem('standing');
var ConnDeviceId;
var deviceList =[];
 


//Creating a variable that checks the newHeight Div and stores it.
var newHeightElem = document.getElementById('newHeight');

//Checks to see if the div of newHeight has data in it, and puts our sitting value in as a standard
if(newHeightElem != null) {
	newHeight.innerHTML = sit;
}

//We create variables that can store our message input, and afterwards inputs the sitting and standing values in their text boxes
var messageInput2Elem = document.getElementById('messageInput2');


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

	 //Makes a fresh list with devices
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
	//Make a list in html and show devices, as long as the name fits our description
		if(device.name == "*Bord 4*") {
		var listItem = document.createElement('li'),
		html = device.name+ "," + device.id;
		listItem.innerHTML = html;
		document.getElementById("bleDeviceList").appendChild(listItem);
		}
}

//Attempts to connect the BT part and the application, returns a status on whether or not it connected.  Based on touch
function conn(){
	var  deviceTouch= event.srcElement.innerHTML;
	document.getElementById("debugDiv").innerHTML =""; // empty debugDiv
	var deviceTouchArr = deviceTouch.split(",");
	ConnDeviceId = deviceTouchArr[1];
	document.getElementById("debugDiv").innerHTML += "<br>"+deviceTouchArr[0]+"<br>"+deviceTouchArr[1]; //for debug:
	ble.connect(ConnDeviceId, onConnect, onConnError);
 }
 
 //sucess in connection, also sends the sitting value to the table selected
function onConnect(){
	var connData = stringToBytes(sit);
	document.getElementById("statusDiv").innerHTML = " Status: Connected";
	document.getElementById("bleId").innerHTML = ConnDeviceId;
	ble.startNotification(ConnDeviceId, blue.serviceUUID, blue.rxCharacteristic, onData, onError);
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, connData, onSend, onError);
}

//failure as well as an explanation as to why
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

function sendData() { // send data to Arduino og changes value in our manual configuration
	 var data = stringToBytes(messageInput.value);
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, data, onSend, onError);
	document.getElementById("newHeight").innerHTML = messageInput.value;
}
	
function onSend(){
}
//Disconnects our device
function disconnect() {
	ble.disconnect(deviceId, onDisconnect, onError);
}
//Changing of our status message, as long as disconnect works
function onDisconnect(){
	document.getElementById("statusDiv").innerHTML = "Status: Disconnected";
}

function onError(reason)  {
	alert("ERROR: " + reason); // real apps should use notification.alert
}
/*Gets the values from our 2 messageInput fields, and saves them to a variable. Then we check to see if they are within our set requirements,
and then we save all the values in Localstorage, as long as the values are witihin the requirements*/
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
//Increases the height of the table, and changes the displayed value in manual configuration
function incHeight() {
	sitting ? sit++ : stand++;
	var data = sitting ? sit : stand;
	var sendData = stringToBytes(String(data));
	document.getElementById("newHeight").innerHTML = data;
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, sendData, onSend, onError);
}

//Decreases the height of the table, and changes the displayed value in manual configuration
function decHeight() {
	sitting ? sit-- : stand--;
	var data = sitting ? sit : stand;
	var sendData = stringToBytes(String(data));
	document.getElementById("newHeight").innerHTML = data;
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, sendData, onSend, onError);
}
//Sends our saved standing value to the BT device, and changes the manual configuration field
function sendStand() {
	sitting = false;
	var sendData = stringToBytes(stand);
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, sendData, onSend, onError);
	document.getElementById("newHeight").innerHTML = stand;
	$('#current-mode').html('standing');
}
//Sends our saved sitting value to the BT device, and changes the manual configuration field
function sendSit() {
	sitting = true;
	var sendData = stringToBytes(sit);
	ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, sendData, onSend, onError);
	document.getElementById("newHeight").innerHTML = sit;
	$('#current-mode').html('sitting');
}