mpscene = (function () {
	"use strict";
	
	var input = {
		rx: 0,
		ry: 0,           
		mx: 0,
		my: 0,
		cx: 160,
		cy: 0,
		ax: 160,
		ay: 0,
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
	};

	// these coordinates are scaled depending on canvas width, which depends on viewport, device width
	var relcoord = {
		scale: 1,
		cw: 320,
		cwhalf: 160,
		ch: 200,
		cfy: 140,
		vfy: 50,
		pw: 50,
		ph: 50,
		pwhalf: 25,
		phhalf: 25,
		iconsize: 24,
		iabove: 70,
		lowrect: [0,140,320,60],
		siderect: [50,0,270,160],
		highrect: [0,0,320,60],
		rectfloor: [0,60,320,140], 
		rectwall: [0,0,320,140],
	}

	// these are fixed sizes of assets
	var pxsize = {
		petanim: 200,
		smallitem: 40,
	}

	var graph = {
		cam: 0,
		fgrid: [],
		wgrid: [],

		prect: [260,170,50,60],
		pvec: [0,relcoord.phhalf,-5],
		psprite: { img:null, sheet:{grp:0, frame:2, size:pxsize.petanim}, rect:[], sizehalf:[25,25] },
		panim: { type:"none", speed:32, click:[0,0], target:[0,0,0], key:null },
		paction: { type:"none", },
		pstate: { fed:0, yestfed:1, spark:0, sleep:false, buff:[], },

		background: null,
		middle: null,

		aabb: [],	// screen rect, slot num ( array elements 0,1 are container aabb's)
		sprites: [], 
	};

	var img = {
		pet: null,
		shop: null,
		speech: null,
		think: null,
		//small: null,	// patch items to use preload? atm image ids->elem are retrieved from document when needed via drawitems
		anim: null, 
	};

	var animKeySeq = {
		walk: { len:4, // number of keyframes
			keyframe0:{grp:0, frame:0, size:pxsize.petanim}, // position of first key frame in anim sprite sheet (assume other keys are next in sprite sheet)
			loop:true, n:0, seq:[0,1,2,3], // sequence of frames to be played
			idle:2,		// animation end with this frame
		},
		eathappy: { len:15, 
			keyframe0:{grp:1, frame:0, size:pxsize.petanim}, 
			//keyframe0:{grp:1, frame:0, size:40}, 
			loop:false, n:0, seq:[0,1,0,1,0,1,0,1,2,1,0,1,2,1,2], 
		},
		eatsad: { len:7, 
			keyframe0:{grp:1, frame:0, size:pxsize.petanim}, 
			loop:false, seq:[0,1,0,1,0,1,3], 
		},
		clean: { len:16, 
			keyframe0:{grp:2, frame:0, size:pxsize.petanim}, 
			loop:false, seq:[0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
		},
	};

	var itemdisp = {
		slot: [ 
			{idx:0, item:null, spr:null, dec:0, slink:0 },
			{idx:0, item:null, spr:null, dec:0, slink:1 },
			{idx:0, item:null, spr:null, dec:0, slink:2 },
			{idx:5, item:null, spr:null, dec:1, dlink:0, slink:0, pos:[0, 100, 50, 50] },
			{idx:2, item:null, spr:null, dec:1, dlink:0, slink:0, pos:[90, 80, 50, 50] },
			{idx:4, item:null, spr:null, dec:2, dlink:0, slink:0, pos:[100, 0, 80, 150] },
		],

		wall:[],
		floor:[],
		pet:[],
		found:[],
		iconsize: 24,
		lowrect: [0,140,320,60],
		siderect: [50,0,270,160],
		highrect: [0,0,320,60],
		rectfloor: [0,60,320,140], //[0, highrect[4], 320, (200-highrect[4])],
		rectwall: [0,0,320,140], //[0, 0, 320, lowrect[1]],
		background: null,
		shop: [],

		select: { active:false, aabb:null, },
	};

	function getPetState() {
		return graph.pstate;
	}

	function getItemSlots() {
		return itemdisp.slot;
	}

	function setPetNextDay() {
		graph.pstate.yestfed = graph.pstate.fed;
		graph.pstate.fed = graph.pstate.spark = 0;
		graph.pstate.buff = [];
		graph.pstate.sleep = (graph.pstate.yestfed===0)? true:false;
	}

	function updatePetStatus(act) {
		if(act==="feed") {
			graph.pstate.fed++;
			graph.pstate.sleep = ( (graph.pstate.fed+graph.pstate.yestfed)>3 )? true:false;
			if(graph.pstate.sleep) graph.pstate.spark = 0;

			graph.panim.type = "short";
			var ak = (graph.pstate.sleep)? animKeySeq.eatsad:animKeySeq.eathappy;
			setPetAnimKeys(ak);
		}
		else if(act==="clean") {
			graph.panim.type = "short";
			//graph.panim.key = animKeySeq.clean;
			setPetAnimKeys(animKeySeq.clean);

			if(!graph.pstate.sleep)
				graph.pstate.spark++;
		}
	}


	function dispItemUpdateShop(itemlist) {
		var i;
		itemdisp.shop = [];
		//var newitem = {idx:0, item:null, spr:null};	// no js object copy with assign / spread in older browsers...
		for(i=0; i<itemlist.length; ++i) {
			var newitem = {idx:itemlist[i], item:null, spr:null};
			itemdisp.shop.push(newitem);
		}	
	}

	function dispItemUpdateDecor(place) {
		// check each slot, update link numbers (used when editing)
		// fill in wall and floor arrays
		itemdisp.wall = [];
		itemdisp.floor = [];
		var i;
		for(i=0; i<itemdisp.slot.length; ++i) {
			var itm = itemdisp.slot[i];
			if(itm) {
				if(itm.dec===1) {
					itm.slink = i;
					itm.dlink = itemdisp.wall.length;
					itemdisp.wall.push(itm);
				} else if(itm.dec===2) {
					itm.slink = i;
					itm.dlink = itemdisp.floor.length;
					itemdisp.floor.push(itm);
				}
			}
		}
	}

	function dispItemAddSlot(idx) {
		var n = itemdisp.slot.length;
		var wh = mpdata.items.all[idx].wh;
		itemdisp.slot.push( {idx:idx, item:null, spr:null, slink:n, dec:0, dlink:0, pos:[0,0,wh[0],wh[1]] } );
	}

	function dispItemRemovePerishedSlot(n) {
		if(itemdisp.slot[n].item.perish) {
			itemdisp.slot[n].item = null;
			itemdisp.slot[n].spr = null;
			itemdisp.slot[n] = null;
			return true;
		}
		return false;
	}

	function dispItemFind(flag, notdec) {
		// find all owned items that are usable with that action
		// notdec: optional, only finds items not already used in decor
		itemdisp.found = [];
		var i;
		for(i=0; i<itemdisp.slot.length; ++i) {
			if(!itemdisp.slot[i]) continue;
			if(notdec && (itemdisp.slot[i].dec!==0)) continue;

			var idx = itemdisp.slot[i].idx;
			if(mpdata.items.hasAction(idx, flag)) {
				var itm = itemdisp.slot[i];
				//{idx:idx, item:itemdisp.slot[i].item, spr:itemdisp.slot[i].spr};
				itemdisp.found.push(itm);
			}
		}
		return itemdisp.found;
	}

	function dispItemTransfer(n, src, dst, x, y) {
		// update item in slot and change position if needed
		// items can move to or from wall(1)/floor(2)/neither(0), 
		var itm = itemdisp.slot[n];
		if(!itm) return;
		if(src!==dst) {
			var from = itm.dec;
			itm.dec = dst;
		}	
		if(x&&y) {
			// update position on wall/floor
			if(dst===1) {
				itm.pos[0] = x;
				itm.pos[1] = y;
			}
			else if(dst===2) {
				var vec = map2dContainerTo3dFloorPos(x, y);
				if(vec) {
					// keep x,z coords, y position will be calculated from the item's height
					itm.pos[0] = vec[0];
					itm.pos[1] = vec[2];
				}
			}			
		}
	}

	function dispItemClearSelection(redraw) {
		itemdisp.select.active = false; 
		itemdisp.select.aabb = null;
		if(redraw && graph.middle) graph.middle(initParams.ctx);
	}

	function setActionFeedback() {
		graph.panim.type="follow";
		// redraw without selection icon
		dispItemClearSelection(true);
		//animUpdate(0);
	}

	function dispItemHit(x, y, act) {
		if(!itemdisp.select.active){
			// no selected item atm, check all possible items 
			var ret = hitAabb(x, y);
			if(ret.hit) {
				itemdisp.select.active = true;
				itemdisp.select.aabb = ret.aabb;

				if(act==="feed"||act==="clean") {
					drawSelectionBox(itemdisp.select.aabb.box);
					updatePetStatus(act);
					// remove if its a perishable item
					dispItemRemovePerishedSlot(itemdisp.select.aabb.n);	
					// trigger anim (with timed feedback message+disable inputs?)
					setTimeout(setActionFeedback, 3000);
				}
				else {
					// draw selection icon 
					drawSelectionBox(itemdisp.select.aabb.box);
				}
				return true;
			}
		}
		else {
			// an item is already selected, check which container was hit
			// this should only happen in wall/floor editing
			var si = itemdisp.select.aabb;
			var ret = hitAabb(x, y, true);
			if(si.dec===0) {
				// a slot item was selected
				if(ret.hit) {
					if(ret.aabb.dec===0) {
						// the slot area is selected again, cancel select, do nothing
					}
					else{
						// decor area, add item to decor position x,y
						var dest = (act==="wall")? 1:2;			
						dispItemTransfer(si.n, 0, dest, x, y);
						dispItemUpdateDecor();
					}
					dispItemClearSelection(true);
				}
			}
			else { 
				// a wall/floor item was selected, check container first
				if(ret.hit) {
					if(ret.aabb.dec===0) {
						// the slot area is selected, remove item from decor
						dispItemTransfer(si.n, si.dec, 0);
						dispItemUpdateDecor();
					}
					else{
						// decor area again, move item to position x,y
						dispItemTransfer(si.n, si.dec, si.dec, x, y);
					}
					dispItemClearSelection(true);
				}
			}
		}

		return false;
	}

	// box = [xleft, xright, ytop, ybottom]
	function pushAabb(box, dec, slotnum) {
		graph.aabb.push( {box:box, dec:dec, n:slotnum} );
	}

	function calcBoundingBox(s) {
		var box = [0,0,0,0];
		if(s.rect.length<4) {
			// calculate new screen space rect from position vec
			var scale = initParams.perspectiveW / (initParams.perspectiveW + s.vec[2]);
			s.rect[0] = (s.vec[0]-s.sizehalf[0])*scale + initParams.centreX ;
			s.rect[1] = (s.vec[1]-s.sizehalf[1])*scale + initParams.centreY ;
			s.rect[2] = s.sizehalf[0]*2*scale;
			s.rect[3] = s.sizehalf[1]*2*scale;
		}
		var r = s.rect;
		box[0] = r[0];
		box[1] = r[0]+r[2];
		box[2] = r[1];
		box[3] = r[1]+r[3];
		return box;
	}

	function drawSelectionBox(box) {
		var ctx = initParams.ctx;
		ctx.beginPath();
		ctx.strokeStyle = 'green';
		ctx.moveTo(box[0], box[2]);
		ctx.lineTo(box[1], box[2]);
		ctx.lineTo(box[1], box[3]);
		ctx.lineTo(box[0], box[3]);
		ctx.lineTo(box[0], box[2]);
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	function hitAabb(x, y, container) {
		var begin = (container)? 0:2;
		var end = (container)? 2:graph.aabb.length;
		var hit = false;
		var aabb = null;
		var i;
		for(i=begin; i<end; ++i) {
			if(graph.aabb[i]) {
				var r = graph.aabb[i].box;
				if(r[0]<x && r[1]>x) {
					if(r[2]<y && r[3]>y) {
						hit = true;
						aabb = graph.aabb[i];
						break;
					}
				} 
			}
		}
		return { hit:hit, aabb:aabb };
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

		// calculate scale factor for relative screen coordinates
		// assume aspect ratio is same...
		if(initParams.w !== 320) {
			var s = relcoord.scale = initParams.w / 320;
			graph.pvec[1] = relcoord.phhalf*s;
			scaleArrayAssign(itemdisp.iconsize, relcoord.iconsize, s);
			scaleArrayAssign(itemdisp.lowrect, relcoord.lowrect, s);
			scaleArrayAssign(itemdisp.siderect, relcoord.siderect, s);
			scaleArrayAssign(itemdisp.highrect, relcoord.highrect, s);
			scaleArrayAssign(itemdisp.rectfloor, relcoord.rectfloor, s);
			scaleArrayAssign(itemdisp.rectwall, relcoord.rectwall, s);
		}

		// fix up pre loaded assets
		img.pet = document.getElementById("imgp0b");
		img.shop = document.getElementById("imgshop");
		img.speech = document.getElementById("img200");
		img.think = document.getElementById("img201");
		img.anim = [];
		var i;
		for(i=0; i<4; ++i) {
			img.anim.push(document.getElementById("imganim"+i.toString()))
		}

		// fix up item display
		dispItemUpdateDecor();

		return true;
	}

	function scaleArrayAssign(dst, src, scale) {
		var i;
		for(i=0; i<dst.length; ++i) {
			dst[i] = src[i]*scale;
		}
	}
		
	var drawScene =	function(canvas, ctx, sg) {
		var ok = checkParams(canvas, ctx);
		if(!ok) return;

		if(!sg) {
			drawTestScene(ctx);
			return;
		}

		if(sg.animtype) {
			graph.panim.type = sg.animtype; //"click";
			graph.psprite.img = img.anim[sg.pet];
		}

		if(sg.action) {
			graph.paction.type = sg.action;

			if(sg.action==="none") {
				graph.middle = null;
				// draw over any previous middle layer graphics
				clearSpriteList();
				graph.background(ctx);	
				drawPet(ctx);
				drawSpriteList(ctx);
			} else {
				dispItemClearSelection();
				clearSpriteList();
				graph.middle = drawPetAction;
				graph.middle(ctx);
				drawSpriteList(ctx);
				//redraw(ctx);
			}
		}

		if(sg.cam)	{
			if(sg.cam===graph.cam) return;

			// reset background
			graph.cam=sg.cam;

			if(graph.cam===1) {
				graph.middle = null;
				graph.background = drawNormalBackground;
			}
			if(graph.cam===2) {
				graph.middle = null;
				graph.background = drawShop;
			}
			if(graph.cam===3) {
				graph.background = drawFarBackground;
			}
			// redraw scene
			clearSpriteList();
			graph.background(ctx);
			if(graph.middle) graph.middle(ctx);
			drawSpriteList(ctx);

			if(graph.cam==2) {
				input.cx = graph.prect[0] = 190;
				input.cy = graph.prect[1] = 150;			
				var s = { img:img.pet, rect:graph.prect };
				blitSprite(ctx, s);
			} else {
				if(graph.panim.type!=="none") drawPet(ctx);
			}
		} 
	}

	var animUpdate = function(dt) {
		if(!initParams.ctx) { 
			return;
		}
		var ctx = initParams.ctx;

		if(graph.panim.type==="none") return;

		// if(graph.panim.type==="clickX") {
		// 	var x = input.cx-160;
		// 	var y = 20;
		// 	var z = -60;
		// 	graph.pvec = [x,y,z];
		// 	clearSpriteList();
		// 	graph.background(ctx);
		// 	drawPet(ctx);
		// 	drawSpriteList(ctx);
		// 	return;
		// }

		if(graph.panim.type==="clickXZ") {
			var vec = map2dContainerTo3dFloorPos(input.cx, input.cy);
			if(vec) {
				graph.pvec = vec;
				clearSpriteList();
				graph.background(ctx);
				if(graph.middle) graph.middle(ctx);
				drawPet(ctx);
				drawSpriteList(ctx);				
			}
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

		if(graph.panim.type==="short") {
			var k = graph.panim.key;
			if(k) {
				// update keyframe sequence, change the image in pet sprite
				var nframe = k.n;
				graph.psprite.sheet.frame = k.seq[nframe];
				var next = nframe+1;
				if(next===k.len) {
					setPetAnimKeys(null);
				}
				else{					
					k.n = next;
				}
				redraw(ctx);
			}				
		}

		if(graph.panim.type==="follow") {

			if(input.ax!==graph.panim.click[0]) {	
				graph.panim.click = [input.ax,input.ay];
				// reset target, map screen space picking coord to 3d floor position
				var z = 5-input.ay;
				var scale = (initParams.perspectiveW + z) / initParams.perspectiveW;
				var midx = relcoord.scale*relcoord.cwhalf;
				var x = (input.ax-midx) * scale;
				var y = relcoord.scale*(relcoord.vfy-relcoord.phhalf);	
				graph.panim.target = [x,y,z];
				setPetAnimKeys(animKeySeq.walk);
			}

			var k = graph.panim.key;
			if( equivalentVectorsXZ(graph.pvec, graph.panim.target) ) {
				// not moving 
				if(!setPetAnimKeys(null))
					return;
			}
			else {
				// move towards target
				stepPosXZ(dt, graph.pvec, graph.panim);

				if(k) {
					// update keyframe sequence, change the image in pet sprite
					var nframe = k.n;
					graph.psprite.sheet.frame = k.seq[nframe];
					var next = ( (nframe+1)===k.len )? 0:(nframe+1);
					k.n = next;
				}				
			}
			redraw(ctx);
			return;
		}

		function redraw(ctx) {
			clearSpriteList();
			graph.background(ctx);
			if(graph.middle) graph.middle(ctx);
			drawPet(ctx);
			drawSpriteList(ctx);
		}
	}


	function setPetAnimKeys(keyseq) {
		if(keyseq) {
			graph.panim.key = keyseq;
			graph.panim.key.n = 0;
			graph.psprite.sheet.grp = keyseq.keyframe0.grp;
		}
		else {
			if(graph.panim.key) {
				if(graph.panim.key.loop) {
					graph.psprite.sheet.frame = graph.panim.key.idle;
				}
				graph.panim.key = null;
			}
			else 
				return false;
		}
		return true;
	}

	function map2dContainerTo3dFloorPos(cx, cy) {
		// ignore clicks near item selection container 
		var itemedge = relcoord.iabove*relcoord.scale;
		if(cy<itemedge) return null;

		// map the screen area below items to a 3d floor position.
		// floor horizon is at scaled floor coord
		var horiz = relcoord.cfy * relcoord.scale;
		var z = (cy<(horiz+1))? 0:(horiz-cy)*3;
		var scale = (initParams.perspectiveW + z) / initParams.perspectiveW;
		var midx = relcoord.cwhalf * relcoord.scale;
		var x = (cx-midx) * scale;
		// todo: remove unused y setting? (proper map from screen y needs floor plane pos - half sprite height
		var y = relcoord.scale*relcoord.vfy;	
		return [x,y,z];
	}

	function equivalentVectorsXZ(v1, v2) {
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
		var imgTest = img.think; 
		var imgSheet = img.anim[0]; 
		ctx.drawImage(imgTest, 150, 100, 40, 60);
		// draw using src & dest rects: (image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
		var sframe=0;
		var sfrmax=5;
		var ssize = 40;
		var dsize = 50;
		for(sframe=0; sframe<sfrmax; ++sframe){
			var s = { img:imgSheet, sheet:{grp:0, frame:sframe, size:ssize}, rect:[10+52*sframe, 100, dsize, dsize] };
			blitSpriteFrame(ctx, s);
			//ctx.drawImage(imgSheet, sframe*ssize, sgrp*ssize, ssize, ssize, 10+52*sframe, 0, dsize, dsize);
		}

		drawWallDecor(ctx);

		var box = [10,70,30,90];
		drawSelectionBox(box);
	}
	
    
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
 
		var words = text.split(' ');
		var line = '';

		for(var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + ' ';
			var metrics = context.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
			context.fillText(line, x, y);
			line = words[n] + ' ';
			y += lineHeight;
			}
			else {
			line = testLine;
			}
		}
		context.fillText(line, x, y);
	}


	function drawItems(ctx, place, background) {
		var dfn = blitSpriteFrame;
		var list = itemdisp.slot;
		var list = itemdisp.found;
		var dock = itemdisp.highrect;
		var msg = null;
		var vert = false;
		var usepos3d = false;
		var usepos2d = false;
		var aabb = true;
	
		switch(place){
			case "feed":
				msg = mpdata.items.msg[0];
				list = dispItemFind(mpdata.actionflag.feed);
				var s = {rect:dock};
				graph.aabb[0] = { box:calcBoundingBox(s), dec:0, n:0 };
				break;
			case "clean":
				msg = mpdata.items.msg[1];
				list = dispItemFind(mpdata.actionflag.clean);
				var s = {rect:dock};
				graph.aabb[0] = { box:calcBoundingBox(s), dec:0, n:0 };
				break;
			case "floor":
				msg = mpdata.items.msg[3];
				list = dispItemFind(mpdata.actionflag.floor, true);
				var s = {rect:dock};
				graph.aabb[0] = { box:calcBoundingBox(s), dec:0, n:0 };
				break;
			case "floornormal":
				dfn = drawSprite;
				list = itemdisp.floor;
				usepos3d = true;
				aabb = false;
				break;
			case "floordecor":
				dfn = drawSprite;
				list = itemdisp.floor;
				usepos3d = true;
				var s = {rect:itemdisp.rectfloor};
				graph.aabb[1] = { box:calcBoundingBox(s), dec:2, n:0 };
				break;
			case "wall":
				msg = mpdata.items.msg[3];
				dock = itemdisp.lowrect;
				list = dispItemFind(mpdata.actionflag.wall, true);
				var s = {rect:dock};
				graph.aabb[0] = { box:calcBoundingBox(s), dec:0, n:0 };
				break;
			case "wallnormal":
				list = itemdisp.wall;
				usepos2d = true;
				aabb = false;
				break;
			case "walldecor":
				list = itemdisp.wall;
				usepos2d = true;
				var s = {rect:itemdisp.rectwall};
				graph.aabb[1] = { box:calcBoundingBox(s), dec:1, n:0 };
				break;
			case "shop":
				msg = mpdata.items.msg[2];
				list = itemdisp.shop;
				dock = itemdisp.siderect;
				vert = true;
				break;
		}

		if(background) {
			ctx.drawImage(background, dock[0], dock[1], dock[2], dock[3]);
		}

		var msize = 0;
		if(msg) {
			msize = 19;
			ctx.font = '14px san-serif';
			ctx.fillStyle = 'rgb(0, 0, 0)';
			var mx = dock[0];	
			//if(vert) 
			{
				ctx.textAlign = "center";
				mx += dock[2]*0.5;
			}
			ctx.fillText(msg, mx, dock[1]+16);
			ctx.textAlign = "start";		
		}
		msg = null;
		var label = null;
		var price = null;
		var dsize = 40;
		var dpsize = dsize+2;
		var xd = dock[0]+20;
		var yd = dock[1]+msize;

		var i;
		for(i=0; i<list.length; ++i){
			var itm;
			if(!list[i].item) {
				itm = mpdata.items.all[list[i].idx];
				// patch in item details and sprite position
				list[i].item = itm;
				var img = document.getElementById(itm.img);
				var spr= {img:img, sheet:null, rect:[]};
				if(itm.sheet) spr.sheet = itm.sheet;
				list[i].spr = spr;	
			}

			if(vert) {
				list[i].spr.rect = [xd, yd+dpsize*i, dsize, dsize];
			} else {
				if(usepos3d) {
					// sprite y pos depends on floor pos, item height & base in image (not necessarily bottom as there might be a shadow)
					var wh = [0,0];
					scaleArrayAssign(wh, list[i].item.wh, relcoord.scale);
					var floory = relcoord.vfy * relcoord.scale;
					var pos = [list[i].pos[0], floory-wh[1]*0.25, list[i].pos[1]];
					list[i].spr.vec = pos;
					list[i].spr.sizehalf = [wh[0]*0.5, wh[1]*0.5];
					list[i].spr.rect = [];
				} else if(usepos2d) {
					var wh = [0,0];
					scaleArrayAssign(wh, list[i].item.wh, relcoord.scale);
					list[i].spr.rect = [list[i].pos[0]-wh[0]*0.5, list[i].pos[1]-wh[1]*0.5, wh[0], wh[1]];
				} else {
					list[i].spr.rect = [xd+dpsize*i, yd, dsize, dsize];						
				}
				if(aabb) pushAabb(calcBoundingBox(list[i].spr), list[i].dec, list[i].slink);
			}

			dfn(ctx,list[i].spr);
			if(vert) {
				itm = mpdata.items.all[list[i].idx];
				msg = itm.desc;
				label = itm.name+':';
				price = itm.buy+' coins';
				wrapText(ctx, msg, xd+64, yd+20+dpsize*i, 150, 16);
				ctx.font = 'bold 14px san-serif';
				ctx.fillText(label, xd, yd+20+dpsize*i);
				ctx.font = '14px san-serif';
				ctx.fillText(price, xd, yd+40+dpsize*i);
			}
		}
	}

	function drawFarBackground(ctx) {
		// Create gradient 
		var w = relcoord.scale * relcoord.cw;
		var h = relcoord.scale * relcoord.ch;
		var lingrad = ctx.createLinearGradient(0, 0, 0, h); // gradient between start and end points (startx,starty,endx,endy)
		lingrad.addColorStop(0, '#00ABEB');	// setup interpolate color from start=0 to end=1
		lingrad.addColorStop(0.7, '#eeeeff');
		lingrad.addColorStop(0.7, '#aaffaa');
		lingrad.addColorStop(1, '#26C000');
		ctx.fillStyle = lingrad;
		ctx.fillRect(0, 0, w, h);
	}

	function drawNormalBackground(ctx) {
		drawFarBackground(ctx);
		drawItems(ctx,"wallnormal");
		// redraw floor colour to emulate clip / 3d
		var w = relcoord.scale * relcoord.cw;
		var h = relcoord.scale * relcoord.ch;
		var fh = relcoord.scale * relcoord.cfy;
		var lingrad = ctx.createLinearGradient(0, fh, 0, h);
		lingrad.addColorStop(0, '#aaffaa');
		lingrad.addColorStop(1, '#26C000');
		ctx.fillStyle = lingrad;
		ctx.fillRect(0, fh, w, h);
		drawItems(ctx,"floornormal");
	}

	function drawPetAction(ctx) {
		// init aabb list for hit testing
		// first 2 entries are reserved for slot item containers
		graph.aabb = [null,null,];

		// draw action usable items
		var act = graph.paction.type;
		if(act==="wall") {
			graph.background(ctx);
			drawItems(ctx,"walldecor");
		} else if(act==="floor") {
			clearSpriteList();
			graph.background(ctx);
			drawItems(ctx,"floordecor");
			drawSpriteList(ctx);
		}
		var imgback = img.think;
		drawItems(ctx, act, imgback);
		// draw selection box
		if(itemdisp.select.active) {
			drawSelectionBox(itemdisp.select.aabb.box);
		}
	}

	function drawWallDecor(ctx) {
		drawItems(ctx,"wallnormal");
		var imgib = img.think;
		drawItems(ctx,"wall", imgib);
	}

	function drawShop(ctx) {
		var lingrad = ctx.createLinearGradient(0, 0, 0, 200); // gradient between start and end points (startx,starty,endx,endy)
		lingrad.addColorStop(0, '#0080AB');	// setup interpolate color from start=0 to end=1
		lingrad.addColorStop(0.75, '#ccccaa');
		lingrad.addColorStop(0.75, '#80cc80');
		lingrad.addColorStop(1, '#26C000');
		ctx.fillStyle = lingrad;

		var w = relcoord.scale * relcoord.cw;
		var h = relcoord.scale * relcoord.ch;
		var fh = relcoord.scale * relcoord.cfy;

		ctx.fillRect(0, 0, w, h);
		ctx.drawImage(img.shop, 0, 0, h*0.6, h);
		var imgib = img.speech;
		drawItems(ctx, "shop", imgib);
	}




	function drawSpriteList(ctx) {
		// z sort first
		graph.sprites.sort(function(a, b) {
			return b.vec[2] - a.vec[2];	// z positive is into screen
		});

		var i;
		for(i=0; i<graph.sprites.length; ++i) {
			var s = graph.sprites[i];
			if(s.sheet) {
				var ss = s.sheet;
				ctx.drawImage(s.img, ss.frame*ss.size, ss.grp*ss.size, ss.size, ss.size, s.rect[0], s.rect[1], s.rect[2], s.rect[3]);
			} else {
				ctx.drawImage(s.img, s.rect[0], s.rect[1], s.rect[2], s.rect[3]);
			}
		}
	}
	function clearSpriteList() {
		// create new empty array, GC the old one when refs are done
		//graph.sprites = [];
		graph.sprites.length = 0;
	}

	function drawSprite(ctx, s, noList) {
		// project 3d vector position to 2d front facing sprite, update position and size in rect
		var scale = initParams.perspectiveW / (initParams.perspectiveW + s.vec[2]);
		s.rect[0] = (s.vec[0]-s.sizehalf[0])*scale + initParams.centreX ;
		s.rect[1] = (s.vec[1]-s.sizehalf[1])*scale + initParams.centreY ;
		s.rect[2] = s.sizehalf[0]*2*scale;
		s.rect[3] = s.sizehalf[1]*2*scale;

		if(!noList) {
			var cs = copySprite(s);
			graph.sprites.push(cs);
		} else {
			if(s.sheet) {
				var ss = s.sheet;
				ctx.drawImage(s.img, ss.frame*ss.size, ss.grp*ss.size, ss.size, ss.size, s.rect[0], s.rect[1], s.rect[2], s.rect[3]);
			} else {
				ctx.drawImage(s.img, s.rect[0], s.rect[1], s.rect[2], s.rect[3]);
			}
		}
	}

	function copySprite(s) {
		var clone = { img:s.img, rect:[s.rect[0], s.rect[1], s.rect[2], s.rect[3]], 
			sheet:null, 
			vec:[s.vec[0],s.vec[1],s.vec[2]], sizehalf:[s.sizehalf[0],s.sizehalf[1]] };

		var ss = s.sheet;
		if(ss) {
			clone.sheet = { grp:ss.grp, frame:ss.frame, size:ss.size };
		}
		return clone;
	}

	function blitSprite(ctx, s) {
		// do not project from 3d, draw immediately using the preset rect param
		ctx.drawImage(s.img, s.rect[0], s.rect[1], s.rect[2], s.rect[3]);
	}

	function blitSpriteFrame(ctx, s) {
		// do not project from 3d, draw immediately using the preset rect param
		// use image in sprite sheet
		if(s.sheet) {
			var ss = s.sheet;
			ctx.drawImage(s.img, ss.frame*ss.size, ss.grp*ss.size, ss.size, ss.size, s.rect[0], s.rect[1], s.rect[2], s.rect[3]);
		} else {
			//draw the whole sheet
			ctx.drawImage(s.img, s.rect[0], s.rect[1], s.rect[2], s.rect[3]);
		}
	}

	function drawPet(ctx, noList) {
		// default is to add pet sprite to sprite list (nolist=null)

		//var s = {img:img.pet, rect:[], vec:[0,20,-180], sizehalf:[25,30]};
		//var s = {img:img.pet, rect:[], vec:graph.pvec, sizehalf:[25,30]};
		var s = graph.psprite;
		s.rect=[];
		s.sizehalf = [relcoord.scale*relcoord.pwhalf, relcoord.scale*relcoord.phhalf];
		s.vec=graph.pvec;
		drawSprite(ctx, s, noList);
		
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

			var itmhit = false;
			if(graph.paction.type!=="none") {
				itmhit = dispItemHit(input.cx, input.cy, graph.paction.type);
			}

			if(!itmhit) {
				input.ax = input.cx;
				input.ay = input.cy;

				if(graph.panim.type!=="none") {					
					var icn = (graph.pstate.spark>2)? "absanim spark":"absanim heart";
					if(graph.pstate.sleep) icn = "absanim sleep";
					iconPos(icn, input.cx, input.cy);
					setTimeout(iconHide, 2000);
				}
			}
		}
	}		

	function iconPos(iconSkin, x, y) {
		var i = document.getElementById("iconanim");
		i.style.display = "block";
		i.style.top = y +'px';
		i.style.left = x +'px';
		i.className = iconSkin;

		var x = document.getElementById("scene");
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
		anim: animUpdate, 
		updateShop: dispItemUpdateShop,
		addItem: dispItemAddSlot,
		updatePet: setPetNextDay,
		petState: getPetState,
		itemSlots: getItemSlots,
    }
	
})();

