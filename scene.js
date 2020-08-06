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

	var graph = {
		cam: 0,
		fgrid: [],
		wgrid: [],

		prect: [150,100,50,60],
		pvec: [0,0,0],
		panim: { type:"none", speed:32, click:[0,0], target:[0,0,0] },

		background: null,

		sprites: [] 
	}

	var img = {
		pet: null,
		shop: null,
	}

	function checkParams(canvas, ctx) {
		if(!canvas || !ctx) {
			printError("bad canvas params");
			return false;
		}

		if(initParams.cvs===canvas) return true;

		if(!initParams.cvs) {
			printDebug("set first canvas");
		} else if(initParams.cvs!==canvas){
			printDebug("resetting canvas");
		}
		initParams.cvs = canvas;
		initParams.w = canvas.width;
		initParams.h = canvas.height;

		initParams.perspectiveW = canvas.width;
		initParams.centreX = canvas.width/2;
		initParams.centreY = canvas.height/2;

		addClickInput(canvas);			

		if(!initParams.ctx) {
			initParams.ctx = ctx;
			printDebug("set first context");
		} else if(initParams.ctx!==ctx){
			printDebug("resetting context");
		}
		initParams.ctx = ctx;

		// fix up pre loaded assets
		img.pet = document.getElementById("imgp0b");
		img.shop = document.getElementById("imgshop");


		return true;
	}

		
	var drawScene =	function(canvas, ctx, sg) {
			var ok = checkParams(canvas, ctx);
			if(!ok) return;
		
		if(!sg) {
			drawTestScene(ctx);
			return;
		}

		if(sg.animtype) {
			console.log("animUpdate: ", sg.animtype);
			graph.panim.type = sg.animtype; //"click";
		}

		if(sg.cam)	{
			graph.cam=sg.cam;
			if(graph.cam==1) {
				graph.background = drawNormalBackground;
				//drawNormalBackground(ctx);
			}
			if(graph.cam==2) {
				graph.background = drawShop;
				//drawShop(ctx);
				//drawPet(ctx);
			}
			graph.background(ctx);
			//drawPet(ctx);
		} 
	}

	var animUpdate = function(dt) {
		if(!initParams.ctx) { 
			return;
		}
		var ctx = initParams.ctx;

		if(graph.panim.type==="none") return;

		if(graph.panim.type==="clickX") {
			var x = input.cx-160;
			var y = 20;
			var z = -60;
			graph.pvec = [x,y,z];
			clearSpriteList();
			graph.background(ctx);
			drawPet(ctx, true);
			drawSpriteList(ctx);
			return;
		}

		if(graph.panim.type==="clickXZ") {
			var z = -input.cy;
			var scale = (initParams.perspectiveW + z) / initParams.perspectiveW;
			var x = (input.cx-160) * scale;
			var y = 20;	// floor pos - half sprite height	
			graph.pvec = [x,y,z];
			clearSpriteList();
			graph.background(ctx);
			drawPet(ctx, true);
			drawSpriteList(ctx);
			return;
		}

		if(graph.panim.type==="blit") {
			graph.prect[0] = input.cx;
			graph.prect[1] = input.cy;			
			graph.background(ctx);
			var s = { img:img.pet, rect:graph.prect };
			blitSprite(ctx, s);
			return;
		}

		if(graph.panim.type==="follow") {

			if(input.cx!==graph.panim.click[0]) {	
				graph.panim.click[input.cx,input.cy];
				// reset target, map screen space picking coord to 3d floor position
				var z = -input.cy;
				var scale = (initParams.perspectiveW + z) / initParams.perspectiveW;
				var x = (input.cx-160) * scale;
				var y = 20;	// floor pos - half sprite height
				graph.panim.target = [x,y,z];
			}

			if( equivalentVectorsXZ(graph.pvec, graph.panim.target) ) return;

			// move towards target
			stepPosXZ(dt, graph.pvec, graph.panim);

			clearSpriteList();
			graph.background(ctx);
			drawPet(ctx, true);
			drawSpriteList(ctx);
			return;
		}

		}

	function equivalentVectorsXZ(v1,v2) {
		// check position is close enough to be considered the same
		var maxdist = 5;
		if ( Math.abs(v1[0]-v2[0]) > maxdist ) return false;
		if ( Math.abs(v1[2]-v2[2]) > maxdist ) return false;
		return true;
	}

	function stepPosXZ(dt,vec3,anim) {
		// update the 3d vector position in place, leave y coordinate as it is, so we move along horizontal to floor
		var tx,tz,len,dx,dz,dsize;
		tx = anim.target[0] - vec3[0];
		tz = anim.target[2] - vec3[2];
		len = Math.sqrt(tx*tx+tz*tz);
		// step in the direction towards target, moving at speed in pixel units per second (dt is in ms)
		dsize = (dt / 1000) * (anim.speed / len);
		dx = tx * dsize;
		dz = tz * dsize;
		vec3[0] += dx;
		vec3[2] += dz;	
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
		ctx.fillRect(25, 25, 70, 70);
		ctx.clearRect(45, 45, 55, 55);
			ctx.strokeRect(50, 50, 50, 50);
			// intersecting rects, opaque red & transparent blue
		    ctx.fillStyle = 'rgb(200, 0, 0)';
		ctx.fillRect(10, 110, 50, 50);	// xy origin is left,top corner. rect params are: (posx,posy,w,h)
			ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
		ctx.fillRect(30, 130, 50, 50);
			
			// Create gradient 
			var lingrad = ctx.createLinearGradient(0, 0, 0, 200); // gradient between start and end points (startx,starty,endx,endy)
			lingrad.addColorStop(0, '#00ABEB');	// setup interpolate color from start=0 to end=1
			lingrad.addColorStop(0.8, '#fff');
			lingrad.addColorStop(0.8, '#a6e0ff');
			lingrad.addColorStop(1, '#26C000');
			ctx.fillStyle = lingrad;
			ctx.fillRect(150, 0, 150, 200);
		
			// images
		var imgPet = document.getElementById("imgp0b");
		var img = document.getElementById("imgalpha");
		ctx.drawImage(imgPet, 150, 100, 40, 60);
		var i;
		for(i=0; i<64; ++i){
			ctx.drawImage(img, 50+4*i, 50+3*i, 16, 16);
		}
	
	}

	function drawNormalBackground(ctx) {
		// Create gradient 
		var lingrad = ctx.createLinearGradient(0, 0, 0, 200); // gradient between start and end points (startx,starty,endx,endy)
		lingrad.addColorStop(0, '#00ABEB');	// setup interpolate color from start=0 to end=1
		lingrad.addColorStop(0.75, '#eeeeff');
		lingrad.addColorStop(0.75, '#aaffaa');
		lingrad.addColorStop(1, '#26C000');
		ctx.fillStyle = lingrad;
		ctx.fillRect(0, 0, 320, 200);
	}

	function drawShop(ctx) {
		var lingrad = ctx.createLinearGradient(0, 0, 0, 200); // gradient between start and end points (startx,starty,endx,endy)
		lingrad.addColorStop(0, '#0080AB');	// setup interpolate color from start=0 to end=1
		lingrad.addColorStop(0.75, '#ccccaa');
		lingrad.addColorStop(0.75, '#80cc80');
		lingrad.addColorStop(1, '#26C000');
		ctx.fillStyle = lingrad;
		ctx.fillRect(0, 0, 320, 200);
		ctx.drawImage(img.shop, 0, 0, 157, 200);
	}




	function drawSpriteList(ctx) {
		// z sort first

		var i;
		for(i=0; i<graph.sprites.length; ++i) {
			var s = graph.sprites[i];
			ctx.drawImage(s.img, s.rect[0], s.rect[1], s.rect[2], s.rect[3]);
		}
	}
	function clearSpriteList() {
		// create new empty array, GC the old one when refs are done
		graph.sprites = [];
	}

	function drawSprite(ctx, s, addToList) {
		// project 3d vector position to 2d front facing sprite, update position and size in rect
		var scale = initParams.perspectiveW / (initParams.perspectiveW + s.vec[2]);
		s.rect[0] = (s.vec[0]-s.sizehalf[0])*scale + initParams.centreX ;
		s.rect[1] = (s.vec[1]-s.sizehalf[1])*scale + initParams.centreY ;
		s.rect[2] = s.sizehalf[0]*2*scale;
		s.rect[3] = s.sizehalf[1]*2*scale;

		if(addToList) {
			graph.sprites.push(s);
		} else {
			ctx.drawImage(s.img, s.rect[0], s.rect[1], s.rect[2], s.rect[3]);
		}
	}

	function blitSprite(ctx, s) {
		// do not project from 3d, draw immediately using the preset rect param
		ctx.drawImage(s.img, s.rect[0], s.rect[1], s.rect[2], s.rect[3]);
	}

	function drawPet(ctx, addToList) {
		//var s = {img:img.pet, rect:[], vec:[0,20,-180], sizehalf:[25,30]};
		var s = {img:img.pet, rect:[], vec:graph.pvec, sizehalf:[25,30]};
		drawSprite(ctx, s, addToList);
		
		//ctx.drawImage(img.pet, 150, 100, 50, 60);
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

			if(graph.panim.type!=="none") {
				//console.log("icon pos:",e);
				iconPos("absanim heart", e);
				setTimeout(iconHide, 2000);
			}
		}
		
			}
		
	function iconPos(iconSkin, e) {
		var i = document.getElementById("iconanim");
		i.style.display = "block";
		i.style.top = e.clientY+'px';
		i.style.left = e.clientX+'px';
		i.className = iconSkin;

		var x = document.getElementById("gamebody");
		x.appendChild(i);
	} 
	function iconHide() {
		var i = document.getElementById("iconanim");
		var x = document.getElementById("iconhide");
		if(x) x.appendChild(i);
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
	
	function printClickEvent(e, src) {
		if(!document.getElementById("debug")) return;
		var position = " x,y: "+input.cx+","+input.cy+" exy: "+e.clientX+","+e.clientY + " canvasxy: "+input.rx+","+input.ry;
		document.getElementById("debug").innerHTML = "debug print "+ count + ": "+ src + position;
		count++;
	}	


return {
		draw: drawScene,
		anim: animUpdate
    }
	
})();

