window.mpgame = {};

mpclient = (function () {
"use strict";

	function gameInit(){
		
		client.scard.tinit = new Date().getTime();
		var intervalId = setInterval(startTimer, client.interdt);
		vsetIconHide();

		client.quiz = menuInit(0);	

		vsetBlockDisplay("scoretext", false);
		vsetBlockDisplay("player", false);
		vsetBlockDisplay("timer", false);
		vsetQA(0);
		setState("start");

		mpmodal();
		client.genprac = new mpgame.aiLevel(client.qstate.sprac, mpdatapatch, true);
		client.gencomp = new mpgame.aiLevel(client.qstate.scomp, mpdatapatch);
		//client.genprac.getMenuPatched(0);

		client.scard.prog = client.prog;
		client.scard.pstate = client.pstate;
		client.scard.qstate = client.qstate;
	}

	var client = {
		tdayms: 1000, //1000*60*60*24, //todo: change to real time, one day=24hours, atm one day=1second
		t: 0,
		dt: 0,
		interdt: 150, //500,
		feedbackColor: ["rgb(0,150,0)","rgb(200,145,8)","rgb(200,0,0)"],
		maxstrike: 3,
		prog: { coins:0, score:0, qnum:0, qsteps:0, feedback:0, level:0, strike:0, acc:0, star:0, state:"none", startms:0 },
		multiplayCb: null,
		sceneAnimCb: null,
		pstate: { fed:0, yestfed:1, spark:0, sleep:false, buff:[] },  
		qstate: { award:0, log:[], ks:0, sprac:[[0,0],[0,0],[0,0],[0,0],[0,0]], scomp:[[0,0],[0,0],[0,0],[0,0],[0,0]], improve:{f:[],s:[]} },
		scard: { tinit:0, tpet:0, tday:0, pet:0, prog:null, pstate:null, qstate:null, items:null },
		shopidxlist: [],
	}


	function menuInit(n){
		var m = { num:n, qs:client.qstate };
		var menu = window.mpdata.init.menu(m);

		if(n===2) menu = client.gencomp.getNext(m);
		if(n===3) menu = client.genprac.getNext(m);
		
		client.prog.qnum = 0;
		if(n==0 && menu.steps>0) {
			client.prog.qsteps = menu.steps;
			vsetProgbar("prog0", client, true);
		}

		return menu;
	}

function menuHelpText() {
	var short = (client.quiz.short)? client.quiz.short:null;
	var spr = null;
	if(client.quiz.sprite) {
		spr = {img:client.quiz.sprite.img, clip:client.quiz.sprite.clip};
	} 
	return { short:short, sprite:spr, help:client.quiz.help };
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

	if(client.sceneAnimCb) {
		client.sceneAnimCb(client.dt);
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
}

function padDigit(i) {
	if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
	return i;
}

function vsetRaceTimer(elemId, t) {
	var x = document.getElementById(elemId);
	var d = new Date(t);
	var m = d.getMinutes();
	var s = d.getSeconds();
	m = padDigit(m);
	s = padDigit(s);
	document.getElementById(elemId).innerText =	m + ":" + s;
} 

function gameReset() {
	client.prog = { coins:0, score:0, qnum:0, qsteps:0, feedback:0, level:0, strike:0, acc:0, star:0, startms:0 };
	client.pstate = { fed:0, yestfed:1, spark:0, sleep:false, buff:[] }; 
	client.qstate = { award:0, log:[], ks:0, sprac:[[0,0],[0,0],[0,0],[0,0],[0,0]], scomp:[[0,0],[0,0],[0,0],[0,0],[0,0]], improve:{f:[],s:[]} };
	client.scard = { tinit:0, tpet:0, tday:0, pet:0, prog:null, pstate:null, qstate:null, items:null };
	client.scard.prog = client.prog;
	client.scard.pstate = client.pstate;
	client.scard.qstate = client.qstate;
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
	case "startsp":
		vsetAxStyle("coin");
		setKeyStage(n);
		setState("ready");
		nextQuestion();
		break;
	case "finish":
		switch(n) {
			case 0:
				gameReset();
				client.quiz = menuInit(0);
				vsetBlockDisplay("scoretext", false);
				vsetBlockDisplay("player", false);
				vsetBlockDisplay("timer", false);
				sceneFinish();
				vsetAxStyle("ib");
				vsetQA(0);
				setState("start");
				break;
			case 1:
				// single player 
				client.quiz = menuInit(3);
				sceneFinish();
				vsetAxStyle("ib");
				vsetQA(0);
				vsetIS("startlevel");
				setState("startsp");
				break;
			case 2:
				// show canvas scene
				setState("pet");
				client.quiz = menuInit(1);
				updatePetDay();
				sceneInit();
				break;
			case 3:
				// multi player
				client.quiz = menuInit(2);
				sceneFinish();
				vsetAxStyle("ib");
				vsetQA(0);
				vsetIS("startlevel");
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
		nextAction(n);
		vsetIS();
		break;
	}
	
	function updateScore(inc){
		if(client.prog.strike>0){
			inc -= client.prog.strike*inc/client.maxstrike; // reduce depending on num of strikes (all js numbers are float)
			client.prog.strike = 0;	// reset strikes for each q
			client.pstate.spark = 0;
			inc = Math.ceil(inc);
		}
		else{
			var icn;
			if(client.pstate.sleep) {
				icn = "absanim sleep";	
			} else {
				// perfect, inc spark & use sparks to get buff (if theres enough)
				client.pstate.spark++;
				if(client.pstate.spark>3) {
					// get buff
					client.pstate.buff.push( nextBuff("p0buffs") );
					client.pstate.spark -= 3;
				}
				icn = (client.pstate.spark>2)? "absanim spark":"absanim heart";				
			} 
			// set animated icon on pet card
			iconCardAnim(icn);
			setTimeout(iconCardHide, 2000);
		}
		client.prog.coins += inc;
		client.prog.acc++;
		vsetIconOnAnswer("abs tick", n);
		client.prog.feedback=0;
		feedbackAnim("correct", inc);
	}
	
	function updateStrike(inc){
		client.prog.strike += inc;
		vsetIconOnAnswer("abs cross", n);
		if(client.prog.strike===client.maxstrike){
			client.prog.strike = client.pstate.spark = 0;
			client.prog.feedback = 2;
			feedbackAnim("fail");
		} else {
			client.prog.feedback=1;	
			feedbackAnim("again", client.maxstrike-client.prog.strike);
		}
	}
}

function setKeyStage(n) {
	client.qstate.ks = n+1;
	var m = {num:n,qs:client.qstate};
	// patch & generate questions depending on key stage
	client.quiz = client.genprac.getPatch(m);

	if(client.quiz.steps>0) {
		client.prog.qsteps = client.quiz.steps;
		vsetProgbar("prog0", client, true);
	}
}

function nextBuff(elemid) {
	var i = client.pstate.buff.length;
	if(multiplayActive()) i+=5;
	if(elemid) {
		// add buff name to elemid in main ui display
		var elem = document.getElementById(elemid);
		if(elem) {
			var spanelem = document.createElement('span');
			spanelem.className = "buff";
			spanelem.innerText = mpdata.spells.buff[i].name;
			elem.appendChild(spanelem);
		}
	}
	return mpdata.spells.buff[i];
}

function clearBuffs(player, tpenalty, playerbuflist, elemid) {
	if(elemid) {
		//remove all buff names on elemid in main ui display
		var elem = document.getElementById(elemid);
		if(elem) {
			while (elem.hasChildNodes()) {  
				elem.removeChild(elem.firstChild);
			} 
		}
	}

	var txt = null;
	var t = 0;
	var p = 0;

	//calculate effect of all buffs
	if(playerbuflist) {
		var i;
		var c = 0;
		for(i=0; i<playerbuflist.length; ++i) {
			var b = playerbuflist[i];
			if(b.c) c+=b.c;
			if(b.t) t+=b.t;
			if(b.p) p+=b.p;
		}
		// update player data applying all their buffs/debuffs
		player.prog.coins += c;
		txt = { info:"", help:"" };
		if(c!==0) txt.info += '  +'+c+' coins';
		t *= 1000; // convert to ms
		var petname = mpdata.pet[player.pet].name;
		txt.help += "Time buffs on " + petname +": "+t+"ms";
	}

	var fails = (player.prog.qsteps - player.prog.acc) + p;
	if(fails<0) fails=0;
	//var tpenalty = 8;
	var tp = fails*tpenalty;
	player.prog.finaltime = player.prog.time + t + tp;

	if(playerbuflist) {
		txt.help += "<br>Time penalties on " + petname+": "+tp+"ms";
		txt.help += "<br>";
		playerbuflist.length = 0;	// clear all buffs ready for next game
	}

	// return any feedback in text
	return txt;
}

function iconCardAnim(iconSkin) {
	var i = document.getElementById("iconanim");
	i.style.display = "block";
	i.style.top = '10px';
	i.style.left = '10px';
	i.className = iconSkin;

	var x = document.getElementById("p0");
	x.appendChild(i);
} 
function iconCardHide() {
	var i = document.getElementById("iconanim");
	var x = document.getElementById("iconhide");
	if(x) x.appendChild(i);
} 

function updatePetDay(){
	var updateshop = false;
	var now = new Date().getTime();
	if(client.scard.tpet===0) {
		// init day counter and shop items
		client.scard.tpet = now;
		client.scard.tday = 1;
		updateshop = true;
	} else {
		var dt = now - client.scard.tpet;
		if(dt>client.tdayms) {
			// its the next day 
			client.scard.tday++;

			// update pet status and shop items
			mpscene.updatePet();
			updateshop = true;
		}
	}

	if(updateshop) {
		var rota = client.scard.tday%3;
		var idxlist;
		if(rota===1) {
			idxlist = [0,1,2];
		}
		if(rota===2) {
			idxlist = [3,4,5];
		}
		if(rota===0) {
			idxlist = [6,7,8];
		}
		client.shopidxlist = idxlist;
		// update shop menu buttons
		var qopt = client.quiz.arr[4].opt;
		var i;
		qopt[0] = 'done<br> <br>';
		for(i=0; i<3; ++i){
			var it = mpdata.items.all[idxlist[i]];
			var txt = it.name + '<br>'+ it.buy +'c';
			qopt[1+i] = txt;
		}
		// update shop items in scene
		mpscene.updateShop(idxlist);
	}
}

function nextAction(n){	
	var q = client.quiz.arr[client.prog.qnum];
	var next = q.to[n];
	updateSceneGraph(client.prog.qnum, n, next);
	var maxidx = client.quiz.arr.length-1;
	vsetIconHide();

	if(next<=maxidx){
		if(updatePetButtonFeedbackAnim(client.prog.qnum, n, next)){
			client.prog.qnum=next;
			vsetQA(next);				
		}		
		//vsetAnswerButtonsActive(true, "ib");
		if(next===maxidx){
			setState("finish");
			client.pstate = mpscene.petState();
			//vsetBlockDisplay("infotext", true);
		}
	}
}

function updatePetButtonFeedbackAnim(q, n, next){
	if(q===4 && next===4) {
		// buying item in the shop
		var coins = client.prog.coins;
		var idx = client.shopidxlist[n-1];
		var price = mpdata.items.all[idx].buy;
		if(price>coins) {
			vsetIconOnAnswer("abs cross", n);
			feedbackShop("fail", coins);
		} else {
			client.prog.coins-=price;
			//client.pstate.itmlist.push(idx);
			mpscene.addItem(idx);
			vsetIconOnAnswer("abs tick", n);			
			feedbackShop("ok", price);
		}	
		return false;
	}
	// continue to next question immediately
	return true;
}

function updateSceneGraph(q, n, next){

	var graph = {cam:1, animtype:"follow", pet:client.pet ,action:"none"};
	if(next===0) {
		vsetSceneDraw("canvas", graph);
		return;
	} 

	if(next===4) {
		graph.cam = 2;
		graph.animtype = "blit";
	}	
	else if(q===2||q===3||q===7||q===8) {
		// scene ui for using items: feed,clean
		if(n===1) {
			graph.action = "feed";
		}	
		else if(n===2) {
			graph.action = "clean";
		}			
	}
	else if(q===1||q===6) {
		// scene ui for using items: floor,wall	
		if(n===2) {
			graph.cam = 3;
			graph.animtype = "none"; //"clickXZ";
			graph.action = "floor";
		}	
		else if(n===3) {
			graph.cam = 3;
			graph.animtype = "none";
			graph.action = "wall";
		}		
	}

	vsetSceneDraw("canvas", graph);
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
			else{
				var bufftxt = clearBuffs(client, 0, client.pstate.buff, "p0buffs");
				var txt = { info:bufftxt.info };
				updateProgressFinish(txt, true);
				var log = updateQuizLog();
				updateSaveData();
				setState("finish");
				//vsetBlockDisplay("infotext", true);
				vsetAnswerButtonsActive(true, "ib");
			}
		} else {
			vsetAnswerButtonsActive(true);
		}
	}
}

function updateProgressFinish(txt, isprac) {

	// display detailed results in modal dialog
	var msg1 = (txt.short)? txt.short:'<p><em>Results</em></p><p>';
	var percent = client.prog.acc*100/client.prog.qsteps;
	var msgstar = "";
	msg1 += mpdata.txt.fini.score +' ';
	msg1 += client.prog.acc+'/'+client.prog.qsteps+'  ('+percent+'%)</p>';

	// update player state table of played levels
	var qstatetable = (isprac)? client.qstate.sprac[client.qstate.ks] : client.qstate.scomp[client.qstate.ks];
	qstatetable[0]++;

	// update player state star count
	if(client.prog.acc===client.prog.qsteps){
		client.prog.star++;
		qstatetable[1]++;
		msg1 += mpdata.txt.fini.acc;
		msgstar = " +1 star"
	}

	var msg2 = "";
	if(txt.help) {
		msg2 += txt.help;
	} else {
		// should be space to show the game help tip
		msg2 += mpdata.txt.fini.help;
	}

	var res = { short:msg1, sprite:null, help:msg2 };
	mpmodal.quizresult.display(res);

	// update main ui, score and info 
	var msgcoin = (txt.info)? txt.info : " ";
	client.prog.level++;
	msg1 = '<span style="color:rgb(0,150,0);">Level Up! '+ msgcoin + msgstar+'.</span>';
	vsetIS(msg1);
}

function setState(s){
	client.prog.state = s;
}
function getState(){
	return client.prog.state;
}

function sceneInit() {

	vsetAxStyle("ib");
	vsetQA(0);
	vsetBlockDisplay("qdiv", false);
	vsetSceneBeforeElem("qdiv", true);

	client.sceneAnimCb = mpscene.anim;
}

function sceneFinish() {
	client.sceneAnimCb = null;
	vsetBlockDisplay("qdiv", true);
	vsetSceneBeforeElem("qdiv", false);
}

function multiplayInit(n) {

	if(n===0) {
		// user pressed 'back' button 
		// don't setup any multiplay & jump to end of quiz menu
		client.prog.qnum=client.quiz.arr.length-1;
		vsetQA(client.prog.qnum);
		setState("finish");
		vsetBlockDisplay("infotext", true);
		vsetAnswerButtonsActive(true, "ib");
		return false;
	}

	var m = {num:n,qs:client.qstate};
	// patch & generate questions depending on key stage
	client.quiz = client.gencomp.getPatch(m);
	if(client.quiz.steps>0) {
		client.prog.qsteps = client.quiz.steps;
		vsetProgbar("prog0", client, true);
	}

	// syncronise start time for all players
	client.prog.startms = client.t;
	client.racems = 0;

	// setup ai players...
	var diff = [0,n-1,n];
	shuffle(diff);
	var allpets = [0,1,2,3];
	var oppopet = removeVal(allpets, client.scard.pet);
	shuffle(oppopet);
	client.p1 = new window.mpgame.aiPlayer(0, oppopet[0], 0);
	client.p2 = new window.mpgame.aiPlayer(n-1, oppopet[1], 0);
	client.p3 = new window.mpgame.aiPlayer(n, oppopet[2], 0);

	var aiplayer = [client.p1, client.p2, client.p3];

	var i;
	for(i=0; i<3; ++i) {
		//aiplayer[i] = new window.mpgame.aiPlayer(diff[i], oppopet[i], 0);
		aiplayer[i].prog = { strike:0, qnum:1, qsteps:client.quiz.steps, acc:0, state:"ready", startms:client.t, time:0 };
	}

	vsetOpponentCards(true, true);
	vsetBlockDisplay("timer", true);

	client.multiplayCb = function(dt) {
		var arr = [ { p:client.p1, id:"qnum1", idp:"prog1"}, { p:client.p2, id:"qnum2", idp:"prog2"}, { p:client.p3, id:"qnum3", idp:"prog3"}, ];
		var n;
		var j;
		client.racems+=dt;
		vsetRaceTimer("timer", client.racems);
		for(j=0; j<3; ++j) {
			n = arr[j].p.update(dt);
			if(multiplayProgUpdate(arr[j].p, n, arr[j].idp)) {
				vsetCard(arr[j].id, arr[j].p);
			}
		}
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

	function multiplayProgUpdate(player, n, idprog) {
		if(n==-1) return false;
		if(player.prog.state == "finish") return false;
		
		if(n==-2) {
			player.prog.strike=0;
			player.prog.feedback=0;
			player.prog.acc++;
			vsetProgbar(idprog, player);
			player.prog.qnum++; 
		} else {
			var q = client.quiz.arr[player.prog.qnum];
			if(q.a==n) {
				player.prog.strike=0;
				player.prog.feedback=0;
				player.prog.acc++;
				vsetProgbar(idprog, player);
				player.prog.qnum++;
			} else {
				player.prog.strike++;

				if(player.prog.strike==client.maxstrike){
					//player.prog.penalty++;
					player.prog.strike=0;
					player.prog.feedback=2;
					vsetProgbar(idprog, player);
					player.prog.qnum++;
				}
				else {
					player.prog.feedback=1;
					vsetProgbar(idprog, player);
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
	vsetBlockDisplay("timer", false);

	// finish the race: set unfinish players progress to '...'
	vsetOpponentCards(true, "finish");
	feedbackAnim("racefinish", 8000, multiplayResults);
}

function predictOrCalcFinalScore(p) {
	// return player's score and ave, or use a predicted score & base time
	var notAi = (p===client.prog);
	if(notAi) {
		if(!p.time) p.time = client.racems;
		p.tpq = p.time/p.qsteps;	//  calc ave time per question
	} else if(p.state === "finish") {
		p.tpq = p.time/p.qsteps;
	} else {
		// predict finish time from ave time per question
		var doneq = (p.qnum>0)? (p.qnum-1) : 0;
		p.tpq = (doneq>0)? client.racems/doneq : client.racems;	// no questions were answered, fix the average response to full race time
		p.time = p.tpq*p.qsteps;
		// predict final score from measured accuracy so far
		var macc = (doneq>0)? p.acc/doneq : 0.5;
		var pscore = macc*p.qsteps;
		p.acc = Math.round(pscore);
	}
	return { score:p.acc, tpq:p.tpq };
}

function updateSaveData() {
	// temp ref copy, proper save will depend on device
	client.scard.prog = client.prog;
	client.scard.qstate = client.qstate;
	client.scard.pstate = client.pstate;

}

function updateQuizLog() {
	var q = client.quiz;
	var p = client.prog;
	var percent = p.acc*100/p.qsteps;

	var log = { level:p.level, name:q.name, uid:q.uid, ks:0, tpqmax:q.tpqmax, pos:0, score:"", percent:percent, tpq:p.tpq, wrolist:[] };
	
	log.score += p.acc+'/'+p.qsteps+'  ('+percent+'%)</p>';
	if(q.ks) log.ks=q.ks;

	client.qstate.log.push(log);
	return log;
}

function setRanking(tpen) {
	var rank = { info:"", txt:"", log:null }
	var bufftxt;
	var player = [client, client.p1, client.p2, client.p3];

	// calculate final time, need to apply and clear all buffs and penalties
	var i;
	for(i=0; i<player.length; ++i) {
		if(i===0) {	
			bufftxt = clearBuffs(player[i], tpen, client.pstate.buff, "p0buffs");
		} else {
			clearBuffs(player[i], tpen);
		}
	}


	// sort players by final time 
	player.sort( function(a,b) {
		return a.prog.finaltime - b.prog.finaltime;
	});

	var p0pos = null;
	// create ranking table
	rank.txt = mpdata.txt.fini.rank;
	
	for(i=0; i<player.length; ++i) {
		if(player[i]===client) p0pos=i+1;	// find position of player 0 while iterating
		rank.txt += '<tr><th scope="row">'+(i+1);
		var petname = mpdata.pet[player[i].pet].name;
		var p = player[i].prog;
		rank.txt += '</th><td>'+petname+'</td><td>'+p.acc+'/'+p.qsteps;
		rank.txt += '</td><td>'+p.time+'</td><td>'+p.finaltime+'</td></tr>';
	}
	rank.txt += '</table>';
	rank.txt += bufftxt.help;
	rank.info += bufftxt.info;

	// copy quiz related data to log
	rank.log = updateQuizLog();
	rank.log.pos = p0pos;

	return rank;
}

function multiplayResults() {
	// calculate race position for each player, including penalty, buffs etc.
	var player = [client, client.p1, client.p2, client.p3];
	var top = { score:-1 };

	var i; var p;
	for(i=0; i<4; ++i) {
		p = predictOrCalcFinalScore(player[i].prog);
		if(p.score>top.score) {
			 top = p;
		}
	}
	var tpenalty = Math.round(top.tpq);
	var rank = setRanking(tpenalty);

	// set text containing player results for modal dialog...
	var txt = { short:null , help:"", info:" " };
	txt.help += rank.txt;
	txt.help += '('+mpdata.txt.fini.penalty + Math.round(tpenalty) +'ms)';
	txt.info += rank.info;

	switch(rank.log.pos) {
		case 1:
			txt.short = mpdata.txt.fini.first; 
			client.prog.award++;
			// need to add item too.?
			break;
		case 2:
			txt.short = mpdata.txt.fini.second; break;
		case 3:
			txt.short = mpdata.txt.fini.third; break;
		case 4:
			txt.short = mpdata.txt.fini.fourth; break;
		default: break;
	}
	
	updateProgressFinish(txt);
	updateSaveData();

	setState("finish");
	//vsetBlockDisplay("infotext", true);
	vsetOpponentCards(false, false);
	vsetAnswerButtonsActive(true, "ib");
}


function vsetOpponentCards(enable, update) {
	//console.log("vsetOpponentCards", client.p1.prog.qnum);
	var eopp = document.getElementById("oppo");
	if(!enable) {
		eopp.style.display="none";
		return;
	} 

	eopp.style.display="inline-block";

	if(update) {
		var msg = false;
		var clear = true;
		if(update==="finish") {
			clear = false; // leave progress bar colours
			msg = "..."; // display unknown number, as we are going jump slow players to the end of the race.
		} else {
			// init styling on card and markers
			vsetProgCard("p1", "pet1", "marker1", client.p1.pet);
			vsetProgCard("p2", "pet2", "marker2", client.p2.pet);
			vsetProgCard("p3", "pet3", "marker3", client.p3.pet);
		}
		
		// set progress info for each opponent
		vsetCard("qnum1", client.p1, msg);
		vsetCard("qnum2", client.p2, msg);
		vsetCard("qnum3", client.p3, msg);
		if(clear) {
			vsetProgbar("prog1", client.p1, clear);
			vsetProgbar("prog2", client.p2, clear);
			vsetProgbar("prog3", client.p3, clear);
		}
	}
}

function vsetCard(id, player, msgunknown) {
	var e = document.getElementById(id);
	if(msgunknown) {
		if(player.prog.qnum!==player.prog.qsteps) 
			e.innerText = msgunknown;
	}
	else{
		e.innerText = player.prog.qnum+"/"+player.prog.qsteps;
	}
}

function vsetProgbar(id, player, reset) {
	var prog = document.getElementById(id); 
	var c = prog.childNodes; 
	var marker;
	var i;

	if(reset) {
		for(i=0; i<c.length; ++i) {
			if (c[i].className=="smallmarker") {
				marker = prog.removeChild(c[i]);
				break;
			}
		}
		while (prog.hasChildNodes()) {  
			prog.removeChild(prog.firstChild);
		} 

		var maxq = player.prog.qsteps;
		var d = document.createElement("div");
		d.className = "smallstep";
		for(i=0; i<maxq; ++i) {
			prog.appendChild(d.cloneNode());
		}
		prog.appendChild(marker);
	} 
	else {
		i = player.prog.qsteps-player.prog.qnum;
		if(player.prog.feedback==1) {
			// can try again so color node, but don't move marker
			c[i].style.backgroundColor = client.feedbackColor[player.prog.feedback];
		} else {
			// put new color node in between the marker and the next element
			marker = c[i+1];
			var node = prog.removeChild(c[i]);
			node.style.backgroundColor = client.feedbackColor[player.prog.feedback];
			prog.insertBefore(node, marker.nextElementSibling);	
		}
	}
}

// Source: https://github.com/Alhadis/Snippets/blob/master/js/polyfills/IE8-child-elements.js
if(!("nextElementSibling" in document.documentElement)){
    Object.defineProperty(Element.prototype, "nextElementSibling", {
        get: function(){
            var e = this.nextSibling;
            while(e && 1 !== e.nodeType)
                e = e.nextSibling;
            return e;
        }
    });
}

function feedbackAnim(res, num, cb) {
	var waitms = 2000;
	var msg;
	vsetAnswerButtonsActive(false);

	if(res==="racefinish") {
		msg = '<span style="color:rgb(0,150,0);">Other players are finishing the race!</span>';
		vsetIS(msg);
		setTimeout(cb, num);
		return;
	}

	vsetProgbar("prog0", client, false);
	
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

function feedbackShop(res,num) {
	var waitms = 3000;
	vsetAnswerButtonsActive(false, 'ib ibgreyout');
	var msg;

	switch(res) {
		case "ok":
			msg = '<span style="color:rgb(0,150,0);">Ok!  -'+num+' coins.</span>';
			vsetIS(msg);
			setTimeout(function(){ vsetAnswerButtonsActive(true, 'ib'); } , waitms);
			break;
		case "fail":
			msg = '<span style="color:rgb(200,0,0);">Not enough coins!  You have '+num+'c.</span>';
			vsetIS(msg);
			setTimeout(function(){ vsetAnswerButtonsActive(true, 'ib'); } , waitms);
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
		client.scard.pet = n;
		client.pet = n;

		// init the player card and progress markers
		vsetProgCard("p0", "pet0", "marker0", n);
	}

	function vsetProgCard( card, face, marker, n) {
		var cardelem = document.getElementById(card);
		cardelem.style.backgroundColor = mpdata.pet[n].col;
		var face = document.getElementById(face);
		face.style.backgroundImage = mpdata.pet[n].img;
		var marker = document.getElementById(marker);
		marker.style.backgroundColor = mpdata.pet[n].col;
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
			var divbegin = '<div id="scene" style="position:relative;">';
			var cvsbegin = '<canvas id="canvas" width="320" height="200">';
			if(window.matchMedia) {
				var mql = window.matchMedia('(min-width: 640px)');
				if(mql.matches) {
					cvsbegin = '<canvas id="canvas" width="640" height="400">';
				}
			}
			x2.insertAdjacentHTML('beforebegin', divbegin+cvsbegin+'Your browser does not support the HTML5 canvas tag.</canvas></div>');	
			x1 = document.getElementById("scene");	
		}
		var graph = {cam:1, animtype:"follow", pet:client.pet, action:null};
			vsetSceneDraw("canvas", graph);
		vsetElemBlockDisplay(x1, enable);
	}

	function vsetSceneDraw(cansvasid, graph) {
		var c = document.getElementById(cansvasid);
		if(!c) return;
		var ctx = c.getContext("2d", { alpha: false });
		if(ctx){
			mpscene.draw(c, ctx, graph);
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
				vsetIS("click");
			}
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
		var str = "Level:"+client.prog.level+"&nbspCoins:"+client.prog.coins+"&nbspStars:"+client.prog.star;	
		//var str = "Level:"+client.prog.level+'&nbsp<span class="star"></span>:'+client.prog.coins+'&nbsp<span class="star"></span>:'+client.prog.star;	
		document.getElementById("scoretext").innerHTML = str;
		
		var cardelem = document.getElementById("p0");
		if(client.prog.qnum>0 && client.prog.qnum<=client.quiz.steps) {
			if(cardelem.onclick) {
				cardelem.onclick = null;
			}
			var progressmsg = client.prog.qnum+"/"+client.quiz.steps;
			document.getElementById("qnum0").innerHTML = progressmsg;
		} else if(!cardelem.onclick) {
				document.getElementById("qnum0").innerHTML = "card";
				cardelem.onclick = function() { mpmodal.card.display(client); };
		} 

		if(!info) {
			return;
		}

		var infoelem = document.getElementById("infotext");
		
		if(info=="reset"){
			infoelem.innerHTML = "Click the answer:";	
			vsetElemBlockDisplay(infoelem, true);
			vsetBlockDisplay("scoretext", true);
			vsetBlockDisplay("player", true);
		}
		else if(info=="startlevel"){
			client.prog.strike = 0;
			client.prog.acc = 0;
			infoelem.innerHTML = "Click the answer:";
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
	dbgScene: vsetSceneDraw,
}

})();
