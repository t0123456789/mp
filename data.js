(function() {
    "use strict";

    function mpdata() {
        this.current = 0;
    };

    // game data for initial menu dialog and quiz
    mpdata.init = {
        menu: function(n) {
            if(n==1) { return this.scenemenu; }		
            if(n==2) { return this.compmenu; }		
            if(n==3) { return this.quiz3; }		
            return this.defaultdata;
        },

        defaultdata: { name:"default", steps:3, level:0, info:"This is a practice level for brain training + pet game. After completing this you will have earned some coins and see various options to relax with your pet or train some more!",
		arr:[
			{ q: "Hello! Which player?", opt:[ "( \\__/ )<br>( ᵔ ᴥ ᵔ )", "/\\.../\\<br>(o . o)", "&nbsp;<br>~{'v'}~", "( )__( )<br>( ᵔ ᴥ ᵔ )" ], a:0, val:0 },
//			{ q: "2 x 3 = ?", opt:[ "5", "8", "6", '<img id="star" width="30" height="30" src="img/star.jpg">' ], a:2, val:6 },
			{ q: "2 x 3 = ?", opt:[ "5", "8", "6", "23" ], a:2, val:6 },
			{ q: "5 + ? = 10", opt:[ "1", "4", "8", "5" ], a:3, val:5 },
			{ q: "7 x 8 = ?", opt:[ "48", "68", "56", "58" ], a:2, val:56 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
		]},
		
	    scenemenu: { name:"pets", steps:4, level:0, info:"This is the place to interact with your pet. (button links are not finished yet)",
		arr:[
			{ q: "Pets love to relax after training! Something to do?", opt:[ "back", "shop", "decor", "items" ], 
																		to:[ 5, 4, 1, 2 ], a:0, val:0 },
			{ q: "Change the view to floor or wall to arrange items", opt:[ "done", "floor", "wall", "normal" ], 
																		to:[ 0, 2, 2, 2 ], a:0, val:0 },
			{ q: "Click on an item to see more actions", opt:[ "done", "feed", "clean", "brush" ], 
																		to:[ 0, 3, 3, 3 ], a:0, val:0 },
			{ q: "What would you like to buy?", opt:[ "done", "food", "ball", "paint" ], 
																		to:[ 0, 4, 4, 4 ], a:0, val:0 },
			{ q: "What would you like to buy?", opt:[ "done", "food", "autoclean", "bow" ], 
																		to:[ 0, 5, 5, 5 ], a:0, val:0 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
		]},
		
	    compmenu: { name:"compete", steps:3, level:0, info:"test multi player",
		arr:[
			{ q: "Loading other players! Join a game?", opt:[ "back", "g1", "g2", "g3" ], a:0, val:0 },
			{ q: "2 x 4 = ?", opt:[ "5", "8", "6", "23" ], a:1, val:8 },
			{ q: "5 + ? = 9", opt:[ "1", "4", "8", "5" ], a:1, val:4 },
			{ q: "6 x 8 = ?", opt:[ "48", "68", "56", "58" ], a:0, val:48 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
		]},
		
	    quiz3: { name:"quiz", steps:4, level:0, info:"This is an example quiz.",
		arr:[
			{ q: "not showing this intro atm. choice of extra bufs/anything?...", opt:[ "0", "1", "2", "3" ], a:0, val:0 },
			{ q: "9 x 3 = ?", opt:[ "27", "28", "21", "23" ], a:0, val:27 },
			{ q: "20 ÷ 4 = ?", opt:[ "5", "8", "6", "24" ], a:0, val:5 },
			{ q: "5 + ? = 10", opt:[ "1", "4", "8", "5" ], a:3, val:5 },
			{ q: "7 x 8 = ?", opt:[ "48", "68", "56", "58" ], a:2, val:56 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
        ]},
        
        defaultimages: { 
            arr:["p0.png","coin.png"] 
        },
		
    };

    window.mpdata = mpdata;
})();