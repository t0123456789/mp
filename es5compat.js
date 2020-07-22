// The standard for JavaScript is ECMAScript (possible versions could be ECMAScript 3, 5, 6 and 7)
// As of 2012, all modern browsers fully support ECMAScript 5.1. (aka Ecma-262 Edition 5.1, its also the target for emscripten)
// Older browsers support at least ECMAScript 3. (explicit JavaScript versioning was Mozilla-specific & deprecated since JavaScript 1.8.5)

"use strict";	// "use strict" directive is new in ECMAScript version 5, ignored in <ECMA5, in ECMA6 it is default.

// check js version dependent feature support for ES6 syntax (eg. Symbol objects, class keyword and arrow functions) 
// 		this is done using the eval() function or other equivalents (e.g. Function() ), 
//  	because writing invalid syntax will stop the script before its execution. 
//		ES6 = ECMAScript version 6 (aka ECMAScript 2015 or Ecma-262 Edition 6)
function checkJsFeatures() {
    //if (typeof Symbol == "undefined") return false;
    try {
        eval("class Foo {}");
        eval("var bar = (x) => x+1");
    } catch (e) { return false; }

    return true;
}

// check whether strict mode is being applied by the browser
//    	in traditional js 'this' = valid global object (and all undeclared variables are implicitly defined on use in global scope.)
//		in strict mode 'this' is 'undefined', so '!this' becomes true.
function isStrictMode(){
    return !this;
} 

if (isStrictMode()) {
	console.log("strict mode is applied by this browser.");
} else {
	console.log("strict mode NOT applied by this browser (ES3?).");
}

// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
function enumerateDevices() {
	if (!isEnumerateDevicesSupported()) {
		return "navigator.mediaDevices NOT supported.";
	}
	// List cameras and microphones.
	navigator.mediaDevices.enumerateDevices()
	.then(function(devices) {
	  devices.forEach(function(device) {
		console.log(device.kind + ": " + device.label +
					" id = " + device.deviceId);
	  });
	})
	.catch(function(err) {
	  console.log(err.name + ": " + err.message);
	});
}

function isEnumerateDevicesSupported() {
	return (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices)? true:false;
}

function es5toggleBlock(elemId) {
	var x = document.getElementById(elemId);
	if (x.style.display == "none") {
		x.style.display = "block";
	} else {
		x.style.display = "none";
	}
} 

function es5ImageOnElem(elemId, imgId) {
	var x = document.getElementById(elemId);
	var img = document.getElementById(imgId);
	//x.getBoundingClientRect();
	x.appendChild(img);	
}

function es5doIt(elemId, show){
	if(!show){
		var hidethis = document.getElementById(elemId);
		hidethis.style.display = "none";
		// logs are still printed in the console...
	}

	var strstrict = '<br>Strict mode: ' + isStrictMode().toString();
	var strfeatures = '<br>JS ECMA6 feature support: ' + checkJsFeatures().toString();
	var struseragent = '<br>User-agent header: ' + navigator.userAgent;
	var strenumdevices = '<br>EnumerateDevices support: ' + isEnumerateDevicesSupported().toString();
	
	var strmsg = '<b>es5doIt:' + strstrict + strfeatures + strenumdevices + struseragent;

	console.log(strmsg);
	display(strmsg, "dbgstatus");		
	
	enumerateDevices();

	function display(msg, eid) {
		if(!show) return;
		if(document.body) {				
			var p = document.getElementById(eid);
			if(p){
				p.innerHTML = msg;
			} else {
				p = document.createElement('p');
				p.innerHTML = msg;
				document.body.appendChild(p);
			}
		}else{
			msg += ' document.body is null atm.';
			console.log(msg);
		}
	}
	
}




