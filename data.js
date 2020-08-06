// The game menu and quiz text is defined in this file
// this file is writen in Javascript which is a programming language.
// but you don't need to know how to program to just change the text in the menus,
// you can just edit the text in a normal text editor.
// It creates some Javascript objects, so when editing basically leave the layout of outer brackets etc the same. 

// In Javascript a line which starts with double slashes like this one is a comment
// we can write anything in a comment and it does not affect the code when your computer reads it.

(function() {
    "use strict";

    function mpdata() {
        this.current = 0;
    };

    // game data for initial menu dialog and quiz
    mpdata.init = {
        menu: function(n) {
            if(n==1) { return this.scenemenu; }		
            if(n==2) { return this.comp2; }		
            if(n==3) { return this.quiz3; }		
            if(n==4) { return this.quiz4; }		
            return this.defaultdata;
        },

        defaultdata: { name:"default", steps:5, level:0, 
        help:"This is a practice level for brain training + pet game. After completing this you will have earned some coins and see various options to relax with your pet or train some more!",
		arr:[
			{ q: "Hello! Which player?", opt:[ "( \\__/ )<br>( ᵔ ᴥ ᵔ )", "/\\.../\\<br>(o . o)", "&nbsp;<br>~{'v'}~", "( )__( )<br>( ᵔ ᴥ ᵔ )" ], a:0, val:0 },
//			{ q: "Hello! Which player?", opt:[ 
//                '<img id="p0" width="80" height="80" src="img/p0.jpg">', 
//                '<img id="p1" width="80" height="80" src="img/p1.jpg">', 
//                '<img id="p2" width="80" height="80" src="img/p2.jpg">', 
//                '<img id="p3" width="80" height="80" src="img/p3.jpg">' ], 
//                a:0, val:0 },
			{ q: "2 × 3 = ?", opt:[ "5", "8", "6", "23" ], a:2, val:6 },
			{ q: "5 + ? = 10", opt:[ "1", "4", "8", "5" ], a:3, val:5 },
            { q: "? + 1 = 10", opt:[ "1", "9", "8", "0" ], a:1, val:9 },
			{ q: "10 - ? = 2", opt:[ "1", "4", "8", "5" ], a:2, val:8 },
			{ q: "7 × 8 = ?", opt:[ "48", "68", "56", "58" ], a:2, val:56 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
		]},
		
        scenemenu: { name:"pets", steps:0, level:0, 
        help:"This is the place to interact with your pet. (There is no way save your progress in this demo version.)",
		arr:[
			{ q: "Pets love to relax after training! Something to do?", opt:[ "back", "shop", "decor", "items" ], 
																		to:[ 5, 3, 1, 2 ], a:0, val:0 },
			{ q: "Change the view to floor or wall to arrange items", opt:[ "done", "normal", "floor", "wall" ], 
																		to:[ 0, 1, 1, 1 ], a:0, val:0 },
			{ q: "Click on an action to use items on your pet", opt:[ "done", "feed", "clean", "brush" ], 
																		to:[ 0, 2, 2, 2 ], a:0, val:0 },
			{ q: "What would you like to buy?", opt:[ "done", "food", "bed", "flowers" ], 
																		to:[ 0, 4, 4, 4 ], a:0, val:0 },
            { q: "What would you like to buy?", opt:[ "done", "food", "tree", "towel" ], 
																		to:[ 0, 5, 5, 5 ], a:0, val:0 },
            { q: "What would you like to buy?", opt:[ "done", "treats", "bubbles", "paint" ], 
																		to:[ 0, 3, 3, 3 ], a:0, val:0 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
		]},
		
        compmenu: { name:"compete", steps:3, level:0, 
        help:"Compete with 3 AI players, unlock new levels and win bonus coins...",
		arr:[
			{ q: "Loading other players! Join a game?", opt:[ "back", "easy", "medium", "hard" ], a:0, val:0 },
			{ q: "2 × 4 = ?", opt:[ "5", "8", "6", "23" ], a:1, val:8 },
			{ q: "5 + ? = 9", opt:[ "1", "4", "8", "5" ], a:1, val:4 },
			{ q: "6 × 8 = ?", opt:[ "48", "68", "56", "58" ], a:0, val:48 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
        ]},
        
        comp2: { name:"compete max len", steps:12, level:0, 
        help:"Compete with 3 ai players, unlock new levels and win bonus coins...",
		arr:[
			{ q: "Loading other players! Join a game?", opt:[ "back", "easy", "medium", "hard" ], a:0, val:0 },
			{ q: "2 × ¼ = ?", opt:[ "¼", "½", "¾", "1" ], a:1, val:24 },
            { q: "3 ÷ 0.3 = ?", opt:[ "0.7", "0.3", "∞", "1" ], a:3, val:33 },
            { q: "50% of 360° = ?", opt:[ "120°", "130°", "180°", "100%" ], a:2, val:180 },
            { q: "10<sup>2</sup> × ? = 1", opt:[ "10<sup>2</sup>", "10<sup>-2</sup>", "10<sup>-1</sup>", "10" ], a:1, val:100 },
            { q: "5 + ? = 9", opt:[ "1", "4", "8", "5" ], a:1, val:4 },
            { q: "5 + ? = 9", opt:[ "1", "4", "8", "5" ], a:1, val:4 },
            { q: "5 + ? = 9", opt:[ "1", "4", "8", "5" ], a:1, val:4 },
            { q: "5 + ? = 9", opt:[ "1", "4", "8", "5" ], a:1, val:4 },
            { q: "5 + ? = 9", opt:[ "1", "4", "8", "5" ], a:1, val:4 },
            { q: "5 + ? = 9", opt:[ "1", "4", "8", "5" ], a:1, val:4 },
			{ q: "5 + ? = 9", opt:[ "1", "4", "8", "5" ], a:1, val:4 },
			{ q: "6 × 8 = ?", opt:[ "48", "68", "56", "58" ], a:0, val:48 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
		]},
		
        quiz3: { name:"quiz", steps:4, level:0, 
        help:"This is an example quiz.",
		arr:[
			{ q: "not showing this intro atm. choice of extra bufs/anything?...", opt:[ "0", "1", "2", "3" ], a:0, val:0 },
			{ q: "9 × 3 = ?", opt:[ "27", "28", "21", "23" ], a:0, val:27 },
			{ q: "20 ÷ 4 = ?", opt:[ "5", "8", "6", "24" ], a:0, val:5 },
			{ q: "5 + ? = 10", opt:[ "1", "4", "8", "5" ], a:3, val:5 },
			{ q: "7 × 8 = ?", opt:[ "48", "68", "56", "58" ], a:2, val:56 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
        ]},
        
        quizMul: { name:"multiplication", steps:4, level:0, 
        help:"This quiz tests your multiplication skills (times tables). If you are not sure begin at KS1. At higher Key Stages, there may be division, decimals, fractions or large numbers.",
		arr:[
			{ q: "Select a Key Stage?...", opt:[ "KS1", "KS2", "KS3", "KS4" ], a:0, val:0 },
			{ q: "9 × 3 = ?", opt:[ "27", "28", "21", "23" ], a:0, val:27 },
			{ q: "20 ÷ 4 = ?", opt:[ "5", "8", "6", "24" ], a:0, val:5 },
			{ q: "7 × 8 = ?", opt:[ "48", "68", "56", "58" ], a:2, val:56 },
			{ q: "0.7 × 5 = ?", opt:[ "5", "3.5", "4.5", "2.5" ], a:1, val:35 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
        ]},
        quizAdd: { name:"addition", steps:4, level:0, 
        help:"This quiz tests your addition skills (times tables). If you are not sure begin at KS1. At higher Key Stages, there may be decimals, fractions, negative or large numbers.",
		arr:[
			{ q: "Select a Key Stage?...", opt:[ "KS1", "KS2", "KS3", "KS4" ], a:0, val:0 },
			{ q: "9 × 3 = ?", opt:[ "27", "28", "21", "23" ], a:0, val:27 },
			{ q: "20 ÷ 4 = ?", opt:[ "5", "8", "6", "24" ], a:0, val:5 },
			{ q: "5 + ? = 10", opt:[ "1", "4", "8", "5" ], a:3, val:5 },
			{ q: "7 × 8 = ?", opt:[ "48", "68", "56", "58" ], a:2, val:56 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
        ]},

        quiz4: { name:"default", steps:0, level:0, 
        help:"This is a practice level for brain training + pet game. After completing this you will have earned some coins and see various options to relax with your pet or train some more!",
		arr:[
			{ q: "Hello! Which player?", opt:[ "( \\__/ )<br>( ᵔ ᴥ ᵔ )", "/\\.../\\<br>(o . o)", "&nbsp;<br>~{'v'}~", "( )__( )<br>( ᵔ ᴥ ᵔ )" ], a:0, val:0 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
		]},
    	
    };

    mpdata.actionflag = {
            feed: 1,
            clean: 2,
            brush: 4,
            wall: 8,
            floor: 16,
        };

    var af = mpdata.actionflag;


    mpdata.items = {
        hasAction: function(idx, actionflag) {
            return (mpdata.items.all[idx].actions&actionflag) ? true : false;
        },

        all: [
            { name:"food", actions:[af.feed], desc:"3 portions of pet food. One portion each day is perfect." },
            { name:"bed", actions:[af.floor], desc:"A comfy bed for your pet." },
            { name:"flowers", actions:[af.floor|af.wall|af.brush], desc:"A pot of colourful blooms can attract wildlife." },
            { name:"tree", actions:[af.floor|af.wall], desc:"A tree will improve your environment." },
            { name:"towel", actions:[af.clean|af.floor|af.wall], desc:"Rub your pet gently to get clean and dry." },
            { name:"bubbles", actions:[af.clean], desc:"Rub your pet gently to smell fresh and clean." },
            { name:"treat", actions:[af.feed], desc:"Crunchy suprise biscuits. A high energy snack." },
            { name:"paint", actions:[af.floor|af.wall], desc:"Change the colour of your wall or floor, permanently." },
        ],
    };


    
    window.mpdata = mpdata;
})();