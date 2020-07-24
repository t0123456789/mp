mpscene = (function () {
	"use strict";

			var input = {
			rx: 0,
			ry: 0,           
            mx: 0,
            my: 0,
            cx: 0,
            cy: 0
            };
			
		window.onmousemove = function(e) {
			input.mx = e.clientX;
			input.my = e.clientY;
			var mstr = "mousemove: "+ input.mx +","+ input.my;
		printClickEvent(e, mstr);
		}

		var count = 0;
		var ecount = 0;

	var initParams = {
		cvs: null,
		ctx: null,
	}

	function checkParams(canvas, ctx) {
		if(!canvas || !ctx) {
			printError("bad canvas params");
			return false;
		}
		if(!initParams.cvs) {
			printDebug("set first canvas");
		} else if(initParams.cvs!==canvas){
			printDebug("resetting canvas");
		}
		initParams.cvs = canvas;
		initParams.w = canvas.width;
		initParams.h = canvas.height;

		if(!initParams.ctx) {
			initParams.ctx = ctx;
			printDebug("set first context");
		} else if(initParams.ctx!==ctx){
			printDebug("resetting context");
		}
		initParams.ctx = ctx;

		return true;
	}

		
	var drawScene =	function(canvas, ctx){
			var ok = checkParams(canvas, ctx);
			if(!ok) return;
		
			drawTestScene(ctx);

			addClickInput(canvas);			
		}

	function saveToFile(canvas) {
		var dataURL = canvas.toDataURL();
		var fullQuality = canvas.toDataURL('image/jpeg', 1.0);
		// data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...9oADAMBAAIRAxEAPwD/AD/6AP/Z"
		var mediumQuality = canvas.toDataURL('image/jpeg', 0.5);
		var lowQuality = canvas.toDataURL('image/jpeg', 0.1);
	}

	function drawTestScene(ctx) {
			// filled, erased then outlined
			ctx.fillStyle = 'rgb(0, 255, 0)';
			ctx.fillRect(25, 25, 100, 100);
			ctx.clearRect(45, 45, 60, 60);
			ctx.strokeRect(50, 50, 50, 50);
			// intersecting rects, opaque red & transparent blue
		    ctx.fillStyle = 'rgb(200, 0, 0)';
			ctx.fillRect(10, 210, 50, 50);	// xy origin is left,top corner. rect params are: (posx,posy,w,h)
			ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
			ctx.fillRect(30, 230, 50, 50);
			
			// Create gradient 
			var lingrad = ctx.createLinearGradient(0, 0, 0, 200); // gradient between start and end points (startx,starty,endx,endy)
			lingrad.addColorStop(0, '#00ABEB');	// setup interpolate color from start=0 to end=1
			lingrad.addColorStop(0.8, '#fff');
			lingrad.addColorStop(0.8, '#a6e0ff');
			lingrad.addColorStop(1, '#26C000');
			ctx.fillStyle = lingrad;
			ctx.fillRect(150, 0, 150, 200);
		
			// images
			var img = document.getElementById("alphacoins");
			ctx.drawImage(img, 150, 150);
	}
			
	function addClickInput(canvas) {
			if (canvas.addEventListener) {                // For all major browsers, except IE 8 and earlier
				canvas.addEventListener("click", function(e) { 
					updateInputCanvasXY(e);
				printClickEvent(e, "addEventListener clicked"); 
				} );
			} else if (canvas.attachEvent) {              // For IE 8 and earlier versions
				canvas.attachEvent("onclick", function(e) { 
					updateInputCanvasXY(e);
				printClickEvent(e, "attachEvent clicked"); } );
			} else {
				printError("canvas.addEventListener or canvas.attachEvent NOT supported.");
			}			

			function updateInputCanvasXY(e) {
				if(canvas.getBoundingClientRect){
					var r = canvas.getBoundingClientRect();
					input.rx = r.left;
					input.ry = r.top;
				} else {
					printError("canvas.getBoundingClientRect NOT supported.");
					// ?recurse parent elements .clientTop and .clientLeft
				}	
				input.cx = e.clientX - input.rx;
				input.cy = e.clientY - input.ry;
			}
		
		function printClickEvent(e, src) {
			if(!document.getElementById("debug")) return;
			var position = " x,y: "+input.cx+","+input.cy+" exy: "+e.clientX+","+e.clientY + " canvasxy: "+input.rx+","+input.ry;
			document.getElementById("debug").innerHTML = "debug print "+ count + ": "+ src + position;
			count++;
		}	
	}		
		
	function printDebug(src) {
		if(!document.getElementById("debug")) return;
		document.getElementById("debug").innerHTML = "debug print "+ count + ": "+ src;
		count++;
	}

		function printError(src) {
			if(!document.getElementById("error")) return;
			document.getElementById("error").innerHTML = "Error print "+ ecount + ": "+ src;
			ecount++;
			console.log(src);
		}		


return {
        draw: drawScene
    }
	
})();

