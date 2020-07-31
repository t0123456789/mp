window.mpgame = {};

mpclient = (function () {
"use strict";

	function gameInit(){
	
	var intervalId = setInterval(startTimer, client.interdt);
	vsetIconHide();
	
	client.quiz = menuInit(0);	
	vsetBlockDisplay("scoretext", false);
	vsetBlockDisplay("player", false);
	vsetQA(0);
	setState("start");

		mpmodal();
}

	var client = {
		t : 0,
		dt : 0,
		interdt : 500,
		maxstrike : 3,
		pet: 0,
		prog: { score:0, qnum:0, level:0, strike:0, acc:0, star:0, state:"none", startms:0 },
		multiplayCb: null,
	}


	function menuInit(n){
		return window.mpdata.init.menu(n);
	}

function menuHelpText() {
	return client.quiz.help;
}

function startTimer() {
	// update current time in ms and the time elapsed since last timedUpdate
	var d = new Date();	
	var ms = d.getTime();	// millisecs since midnight January 1 1970
	if(client.t) {
		client.dt = ms-client.t;
	}
	client.t = ms;
	//console.log("timer: ", ms);

	if(client.multiplayCb) {
		client.multiplayCb(client.dt);
	}

	
	if(document.getElementById('dbgtimer')){
		var h = d.getHours();
		var m = d.getMinutes();
		var s = d.getSeconds();
		m = padDigit(m);
		s = padDigit(s);
		document.getElementById('dbgtimer').innerHTML =
			h + ":" + m + ":" + s + " ms:" + ms + " dt:" + client.dt;
	}
	
	function padDigit(i) {
	  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
	  return i;
	}
}

function menuUpdate(n){
	var qn = client.prog.qnum;	
	// js assign op: For primitive types, makes a copy with same value. For object, makes ref to same underlying data

	switch(getState()) {
	case "start":
		vsetPlayerPet(n);
		vsetIS("reset");
		vsetAxStyle("coin");
		setState("ready");
		nextQuestion();
		break;
	case "startmp":
		// get opponents
		if(multiplayInit(n)) {
			vsetAxStyle("coin");
			setState("ready");
			nextQuestion();
		}
		break;
	case "finish":
		switch(n) {
			case 0:
				client.quiz = menuInit(0);
				vsetBlockDisplay("scoretext", false);
				vsetBlockDisplay("player", false);
				vsetBlockDisplay("qdiv", true);
				vsetSceneBeforeElem("qdiv", false);
				client.prog.qnum = 0;
				vsetAxStyle("ib");
				vsetQA(0);
				setState("start");
				break;
			case 1:
				// single player 
				client.quiz = menuInit(3);	// get random quiz instead of default
				client.prog.qnum = 1;
				vsetBlockDisplay("qdiv", true);
				vsetSceneBeforeElem("qdiv", false);
				vsetAxStyle("coin");
				vsetQA(1);
				setState("ready");
				break;
			case 2:
				// show canvas scene
				setState("pet");
				client.quiz = menuInit(1);
				client.prog.qnum = 0;
				vsetAxStyle("ib");
				vsetQA(0);
				vsetBlockDisplay("qdiv", false);
				vsetSceneBeforeElem("qdiv", true);
				break;
			case 3:
				// multi player
				client.quiz = menuInit(2);
				client.prog.qnum = 0;
				vsetBlockDisplay("qdiv", true);
				vsetSceneBeforeElem("qdiv", false);
				vsetAxStyle("ib");
				vsetQA(0);
				setState("startmp");
				break;
			default:
				break;
		}
		break;
	case "ready":
		var q = client.quiz.arr[qn];
		if(q.a==n){
			updateScore(q.val);
		}else{
			updateStrike(1);
		}
		vsetIS();
		break;
	case "pet":
		var q = client.quiz.arr[qn];
		nextQuestion();
		vsetIS();
		break;
	}
	
	function updateScore(inc){
		if(client.prog.strike>0){
			inc -= client.prog.strike*inc/client.maxstrike; // reduce score depending on num of strikes (all js numbers are float)
			client.prog.strike = 0;	// reset strikes for each q
			inc = Math.ceil(inc);
		}
		client.prog.score += inc;
		vsetIconOnAnswer("abs tick", n);
		feedbackAnim("correct", inc);
	}
	
	function updateStrike(inc){
		client.prog.strike += inc;
		vsetIconOnAnswer("abs cross", n);
		if(client.prog.strike==client.maxstrike){
			client.prog.strike=0;
			feedbackAnim("fail");
		} else {	
			feedbackAnim("again", client.maxstrike-client.prog.strike);
		}
	}
}

function nextQuestion(){	
	client.prog.qnum++;
	var maxidx = client.quiz.arr.length-1;
	vsetIconHide();
	if(client.prog.qnum<=maxidx){
		vsetQA(client.prog.qnum);			
		
		if(client.prog.qnum==maxidx){
			if(multiplayActive()) {
				multiplayFinish();
			}
			setState("finish");
			vsetBlockDisplay("infotext", true);
			vsetAnswerButtonsActive(true, "ib");
		} else {
			vsetAnswerButtonsActive(true);
		}
	}
}

function setState(s){
	client.prog.state = s;
}
function getState(){
	return client.prog.state;
}

function multiplayInit(n) {

	if(n==0) {
		// user pressed 'back' button 
		// don't setup any multiplay & jump to end of quiz menu
		client.prog.qnum=client.quiz.arr.length-1;
		vsetQA(client.prog.qnum);
		setState("finish");
		vsetBlockDisplay("infotext", true);
		vsetAnswerButtonsActive(true, "ib");
		return false;
	}

	// syncronise start time for all players
	client.prog.startms = client.t;

	// setup ai players...
	var diff = [0,n-1,n];
	shuffle(diff);
	var allpets = [0,1,2,3];
	var oppopet = removeVal(allpets, client.pet);
	shuffle(oppopet);
	client.p1 = new window.mpgame.aiPlayer(0, oppopet[0], 0);
	client.p2 = new window.mpgame.aiPlayer(n-1, oppopet[1], 0);
	client.p3 = new window.mpgame.aiPlayer(n, oppopet[2], 0);

	var aiplayer = [client.p1, client.p2, client.p3];

	var i;
	for(i=0; i<3; ++i) {
		//aiplayer[i] = new window.mpgame.aiPlayer(diff[i], oppopet[i], 0);
		aiplayer[i].prog = { strike:0, qnum:1, qsteps:client.quiz.steps, penalty:0, state:"ready", startms:client.t, time:0 };
	}

	vsetOpponentCards(true, true);

	client.multiplayCb = function(dt) {
		var arr = [ { p:client.p1, id:"qnum1"}, { p:client.p2, id:"qnum2"}, { p:client.p3, id:"qnum3"}, ];
		var n;
		var j;
		for(j=0; j<3; ++j) {
			n = arr[j].p.update(dt);
			if(multiplayProgUpdate(arr[j].p, n)) {
				vsetCard(arr[j].id, arr[j].p);
			}
		}
	
		// n = client.p1.update(dt);
		// console.log("multiplayCb", n);
		// if(multiplayProgUpdate(client.p1, n)) {
		// 	vsetCard("qnum1", client.p1);
		// }
	}

	function shuffle(array){
		// loop each element in array in reverse order
		var i;
		for (i = array.length - 1; i > 0; i--) {
			// pickup a random element before this element and swap them
			var j = Math.floor(Math.random() * i);
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
	};

	function removeVal(array, val){
		var arr = [];
		var i;
		for (i=0; i <= array.length - 1; ++i) {
			if(array[i]!==val) arr.push(array[i]);
		}
		return arr;
	};

	function multiplayProgUpdate(player, n) {
		if(n==-1) return false;
		if(player.prog.state == "finish") return false;
		
		console.log("multiplayProgUpdate: ", player.prog.qnum, client.maxstrike);
		if(n==-2) {
			player.prog.qnum++; player.prog.strike=0;
		} else {
			var q = client.quiz.arr[player.prog.qnum];
			if(q.a==n) {
				player.prog.qnum++;
			} else {
				player.prog.strike++;
				if(player.prog.strike==client.maxstrike){
					player.prog.qnum++;
					player.prog.penalty++;
					player.prog.strike=0;
				}
			}
		}

		if(player.prog.qnum>player.prog.qsteps) {
			player.prog.qnum=player.prog.qsteps;
			player.prog.state = "finish";
			player.prog.time = client.t - player.prog.startms; 
		}
		return true;	
	};

	return true;
}

function multiplayActive() {
	return (client.multiplayCb)? true:false;
}

function multiplayFinish() {
	client.multiplayCb = null;
		// show some sort of result in modal dialog / feedback anim...

	vsetOpponentCards(false, false);
}


function vsetOpponentCards(enable, update) {
	console.log("vsetOpponentCards", client.p1.prog.qnum);
	var eopp = document.getElementById("oppo");
	if(!enable) {
		eopp.style.display="none";
		return;
	} 

	eopp.style.display="inline-block";

	if(update) {
		// set progress info for each opponent
		vsetCard("qnum1", client.p1);
		vsetCard("qnum2", client.p2);
		vsetCard("qnum3", client.p3);
	}
}

function vsetCard(id, player) {
	var e = document.getElementById(id);
	var txt = player.prog.qnum+"/"+player.prog.qsteps;
	e.innerText = txt;
}


function feedbackAnim(res, num) {
	var waitms = 1000;
	vsetAnswerButtonsActive(false);
	var msg = "feedback";
	
	switch(res) {
		case "correct":
			msg = '<span style="color:rgb(0,150,0);">Correct!  +'+num+' coins.</span>';
			vsetIS(msg);
			setTimeout(nextQuestion, waitms);
			break;
		case "again":
			msg = '<span style="color:rgb(200,130,70);">Whoops!  '+num+' chances left.</span>';
			vsetIS(msg);
			setTimeout(function(){ vsetAnswerButtonsActive(true); } , waitms);
			break;	
		case "fail":
			msg = '<span style="color:rgb(200,0,0);">Wrong answer. Move on...</span>';
			vsetIS(msg);
			setTimeout(nextQuestion, waitms);
			break;			
	}
}

	function menuKeyProc(event, id) {
		var x = event.keyCode;
		switch(x){
			case 13:
				// 'enter' key was pressed
				menuUpdate(id);
				break;
			case 37:
				// 'left arrow' pressed
				var next = (id>0)? id-1 : 3; 
				vsetAnswerButtonFocus(next);
				break;
			case 39:
				// 'right arrow' pressed
				var next = (id<3)? id+1 : 0; 
				vsetAnswerButtonFocus(next);
				break;
			default:
				break;
		}
	}

	function vsetPlayerPet(n) {
		client.pet = n;
	}


	// only works if game buttons have active selection, eg via tab key from the OS / browser window
		// maybe init/force it on buttons for any mouse click on body?
		//	var elem = document.activeElement;
		//	console.log("The Unicode value is: ", x, elem.id, id);
	function vsetAnswerButtonFocus(next) {
		var nextelem = "a"+next;
		document.getElementById(nextelem).focus(); 
	}

function vsetSceneBeforeElem(elemId, enable) {
	var x1 = document.getElementById("scene");	
	if(!x1){
		var x2 = document.getElementById(elemId);
			x2.insertAdjacentHTML('beforebegin', '<div id="scene"><canvas id="canvas" width="320" height="200">Your browser does not support the HTML5 canvas tag.</canvas></div>');	
		x1 = document.getElementById("scene");	

		vsetSceneDraw();
	}
	vsetElemBlockDisplay(x1, enable);
}

function vsetSceneDraw() {
	var c = document.getElementById("canvas");
	if(!c) return;
	var ctx = c.getContext("2d", { alpha: false });
	if(ctx){
		mpscene.draw(c, ctx);
	} else {
		console.log("Error: CanvasRenderingContext2D not valid.");
	}  	  	
}

function vsetIconOnAnswer(iconSkin, n) {
	var i = document.getElementById("icon");
	i.style.display = "block";
	i.className = iconSkin;
	var idstr = "a"+n;
	var x = document.getElementById(idstr);
	x.appendChild(i);
} 
function vsetIconHide() {
	var i = document.getElementById("icon");
	var x = document.getElementById("iconhide");
	if(x) x.appendChild(i);
	//i.style.display = "none";
} 

	function vsetAnswerButtonsActive(enable, skin) {
	var maxi = 4;	
	var i;
	for( i = 0; i < maxi; i++){ 
		var idstr = "a"+i;
		//document.getElementById(idstr).disabled = !enable;	//only for buttons?
		if(enable) {
			//document.getElementById(idstr).onclick = function() { checkAnswer(i); }; 
			// js lambda scope is function-level, not block-level, so context when fn is created is at end of scope, then function-level variable i has the value 5. Fix: add createfn(i) or wrap in extra closure...
			document.getElementById(idstr).onclick = (function(tmp) { 
													return function() { mpclient.checkAnswer(tmp); }
											})(i);
		} else {
			document.getElementById(idstr).onclick = null;
		}
	}	
	
	if(enable) {
		vsetIconHide();
			if(skin) {
				vsetAxStyle(skin);
			} else {
		vsetAxStyle("coin");
			}
		vsetIS("click");
	} else {
			if(skin) {
				vsetAxStyle(skin);
			} else {
				vsetAxStyle("coin coingreyout");
			}
	}

}

function vsetAxStyle(skin){
	var maxi = 4;	
	var i;
	for( i = 0; i < maxi; i++){ 
		var idstr = "a"+i;
		document.getElementById(idstr).className = skin;
	}
}

function vsetIS(info) {		
	var str = "Coins:"+client.prog.score+"&nbsp Level:"+client.prog.level+"&nbsp Strike:"+client.prog.strike;	
	document.getElementById("scoretext").innerHTML = str;
	
	if(client.prog.qnum>0 && client.prog.qnum<=client.quiz.steps) {
		var progressmsg = client.prog.qnum+"/"+client.quiz.steps;
		document.getElementById("qnum0").innerHTML = progressmsg;
	}

	if(!info) {
		return;
	}

	var infoelem = document.getElementById("infotext");
	
	if(info=="reset"){
		client.prog.score = 0;
		client.prog.strike = 0;
		client.prog.acc = 0;
		client.prog.level = 0;	

		infoelem.innerHTML = "Click the answer:";	
		vsetElemBlockDisplay(infoelem, true);
		vsetBlockDisplay("scoretext", true);
		vsetBlockDisplay("player", true);
	}
	else if(info=="feedback"){
		infoelem.innerHTML = "feedback: waiting ...";	
	}
	else if(info=="click"){
		infoelem.innerHTML = "Click the answer:";			
	} else {
		infoelem.innerHTML = info;
	}
	
}

function vsetQA(n){
	var qn = client.quiz.arr[client.prog.qnum];
	var pq;
	
	if(getState()=="pet") {
		// print question in the info area, question div is replaced with canvas...
		pq = document.getElementById("infotext");
	} else {
		pq = document.getElementById("questiontext");
	}
	pq.innerHTML = qn.q;
	
	var i;
	var maxi = qn.opt.length;	
	for( i = 0; i < maxi; i++){ 
		var idstr = "a"+i;
		document.getElementById(idstr).innerHTML = qn.opt[i];	
	}
}

function vsetBlockDisplay(elemId, enable) {
	var x = document.getElementById(elemId);
	vsetElemBlockDisplay(x,enable);
} 
function vsetElemBlockDisplay(elem, enable) {
  if (enable) {
		elem.style.display = "block";
  } else {
		elem.style.display = "none";
  }
  //elem.style.display = (enable)? "block":"none";  
} 

return {
	gameStart: gameInit,
	checkAnswer: menuUpdate,
	keyPress: menuKeyProc,
	contextHelpText: menuHelpText,
}

})();
