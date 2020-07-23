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
}

	var client = {
		t : 0,
		dt : 0,
		interdt : 500,
		maxstrike : 3,
		prog : { score:0, qnum:0, level:0, strike:0, acc:0, star:0, state:"none" }
	}


	function menuInit(n){
		return window.mpdata.init.menu(n);
	}

function startTimer() {
	var d = new Date();	
	var ms = d.getTime();	// millisecs since midnight January 1 1970
	if(client.t) {
		client.dt = client.t-ms;
	}
	client.t = ms;
	
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
		vsetIS("reset");
		vsetAxStyle("coin");
		setState("ready");
		nextQuestion();
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
				// multi player, get level & opponents
				client.quiz = menuInit(2);
				client.prog.qnum = 1;
				vsetBlockDisplay("qdiv", true);
				vsetSceneBeforeElem("qdiv", false);
				vsetAxStyle("coin");
				vsetQA(0);
				setState("ready");
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

function feedbackAnim(res, num) {
	var waitms = 1000;
	vsetAnswerButtonsActive(false);
	var msg = "feedback";
	
	switch(res) {
		case "correct":
			msg = "Correct!  +"+num+" coins.";
			vsetIS(msg);
			setTimeout(nextQuestion, waitms);
			break;
		case "again":
			msg = "Whoops, think again.  +"+num+" more chances.";
			vsetIS(msg);
			setTimeout(function(){ vsetAnswerButtonsActive(true); } , waitms);
			break;	
		case "fail":
			msg = "Wrong answer.  Let's move on...";
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
		x2.insertAdjacentHTML('beforebegin', '<div id="scene"><canvas id="canvas" width="300" height="300">Your browser does not support the HTML5 canvas tag.</canvas></div>');	
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
}

})();
