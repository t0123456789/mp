// The game menu and quiz text is defined in this file
// this file is writen in Javascript which is a programming language.
// but you don't need to know how to program to just change the text in the menus,
// you can just edit the text in a normal text editor.
// It creates some Javascript objects, so when editing basically leave the layout of outer brackets etc the same. 

// In Javascript a line which starts with double slashes like this one is a comment
// we can write anything in a comment and it does not affect the code when your computer reads it.

(function() {
    "use strict";

    function mpdata() {};
    // game data for initial menu dialog and quiz
    mpdata.init = {
        current: null,

        menu: function(n) {
            var q = this.quizempty; //this.tutorial; //this.quizempty;
            if(n) {
                if(n.num===1) { q = this.scenemenu; }		
                if(n.num===2) { q = this.comp1; }		
                if(n.num===3) { q = this.quizAdd; }	
                if(n.num===4) { q = this.continue; }	
                	
                if(n.ref) {
                    // override any settings if there is a data reference 
                    q = n.ref;
                }
            }
            this.current = q;
            return q;
        },

        tutorial: { name:"Tutorial", steps:3, level:0, uid:1, tpqmax:7,
        short:'<p>MathPets:<br>A brain training + pet game.</p>',
        sprite:{ img:"url('img/npchelp.png')", clip:"rect(20px,40px,60px,0px)" }, //rect (top, right, bottom, left) 
        help:'<p>Begin by choosing your pet, then read each question carefully and click on an answer.</p>'+
            '<p>After completing this practice level you will have earned some coins and have options to set up your Key Stage, train some more or relax with your pet.</p>'+
            '<p><em>Game Tips</em><p>Your pet is always happy to practice with you! Don\'t worry if you make a mistake; just try again.</p>'+
            '<p>(add footer contact / link.)</p>',
		arr:[
			//{ q: "Ready to start?<br>Click on a box to choose a pet.", opt:[ "( \\__/ )<br>( ᵔ ᴥ ᵔ )", "/\\.../\\<br>(o . o)", "&nbsp;<br>~{'v'}~", "( )__( )<br>( ᵔ ᴥ ᵔ )" ], a:0, val:0 },
			{ q: "Ready to start?<br>Click on a box to choose a pet.", opt:[ 
                '<img width="100%" height="100%" src="img/p0.jpg">', 
               '<img width="100%" height="100%" src="img/p1.jpg">', 
               '<img width="100%" height="100%" src="img/p2.jpg">', 
               '<img width="100%" height="100%" src="img/p3.jpg">' ], 
               a:0, val:0 },            
            { q: 'There are 3 questions in this tutorial.<br>Question 1:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp 1 + 1 = ? &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', opt:[ "1", "2", "3", "0" ], a:1, val:2 },
			{ q: 'Question 2:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp 10 - 2 = ? &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp', opt:[ "5", "8", "6", "12" ], a:1, val:8 },
			{ q: "Last question:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp 7 + ? = 10 &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp ", opt:[ "5", "4", "3", "2" ], a:2, val:3 },
			{ q: "Tutorial finished!<br>Click <b>[next]</b> to set your Key Stage and practice more.<br>Click <b>[pet]</b> to interact with your pet.", opt:[ "options", "next", "pet", "compete" ], a:0, val:0 },
		]},
		
        scenemenu: { name:"pets", steps:0, level:0, uid:2,
        short:'<p>Click <b>[pet]</b> to interact with your pet and <b>[back]</b> to return to the training options.</p>',
        help:'<p>Click <b>[shop]</b> to buy items using your coins. The items change each day.</p>'+
        '<p>Use <b>[items]</b> to care for your pet. Your pet needs to eat the correct amount to stay alert.</p>'+
        '<p>You can <b>[decor]</b>ate your pet\'s home using certain items. To arrange items on the wall or floor click the item you want to move then click where you want to put it.</p>'+
        '<p><em>Game Tips</em></p><p>With regular care your pet can sparkle when you go into training and get buffs earlier, while under or over feeding can cause sleepiness.</p>'+
        '<p>(add footer contact / link.)</p>',
		arr:[
			{ q: "Pets love to relax after training! Something to do?", opt:[ "back", "shop", "decor", "items" ], 
																		to:[ 9, 4, 1, 2 ], a:0, val:0 },
			{ q: "Change the view to floor or wall to arrange items", opt:[ "done", "normal", "floor", "wall" ], 
																		to:[ 0, 1, 6, 6 ], a:0, val:0 },
			{ q: "Click on an action to use items on your pet", opt:[ "done", "feed", "clean", "stroke" ], 
																		to:[ 0, 3, 7, 8 ], a:0, val:0 },
            { q: "Select a food item above or do something else?", 
                                                opt:[ "done", "feed", "clean", "stroke" ],
                                                to:[ 0, 3, 7, 8 ], a:0, val:0 },
            { q: "What would you like to buy?", 
                                                opt:[ "done", "food", "bed", "flowers" ], 
												to:[ 0, 4, 4, 4 ], a:0, val:0 },
            { q: "spare.", 
                                                opt:[ "done", "place", "remove", "clear" ], 
												to:[ 0, 5, 5, 5 ], a:0, val:0 },
            { q: "Change the view to floor or wall to arrange items", 
                                                opt:[ "done", "normal", "floor", "wall" ], 
                                                to:[ 0, 1, 6, 6 ], a:0, val:0 },
            { q: "Select an item above to use it or do something else?", 
                                                opt:[ "done", "feed", "clean", "stroke" ],
                                                to:[ 0, 3, 7, 8 ], a:0, val:0 },			
            { q: "Touch your pet to stroke it or do something else?", 
                                                opt:[ "done", "feed", "clean", "stroke" ],
                                                to:[ 0, 3, 7, 8 ], a:0, val:0 },
            { q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
        ]},

        quizAdd: { name:"Addition", steps:4, level:0, uid:3, tpqmax:5,
        short:"Practice addition and subtraction skills.",
        help:'<p>The Key Stage (KS) limits the range of numbers: KS1 starts with zero to ten. KS4 is anything.</p>'+
            '<p>If you are not sure begin at KS1, you can change it each time you practice. At later stages, there may be different number types such as decimals, fractions, negative or large numbers.</p>'+
            '<p><em>Game Tips</em></p><p>If you train a little each day you will make good progress. Wherever you start the range of numbers and question variations will change gradually as you play.</p>',
        arr:[
			{ q: "Select a Key Stage...", opt:[ "KS1", "KS2", "KS3", "KS4" ], a:0, val:0 },
			{ q: "9 × 3 = ?", opt:[ "27", "28", "21", "23" ], a:0, val:27 },
			{ q: "20 ÷ 4 = ?", opt:[ "5", "8", "6", "24" ], a:0, val:5 },
			{ q: "5 + ? = 10", opt:[ "1", "4", "8", "5" ], a:3, val:5 },
			{ q: "7 × 8 = ?", opt:[ "48", "68", "56", "58" ], a:2, val:56 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
        ]},        
        quizMul: { name:"Multiplication", steps:4, level:0, uid:4, tpqmax:5,
        short:"Practice multiplication and division skills (times tables).",
        help:'<p>KS1 starts with 2, 5, 10, double and half. KS2 includes up to 12 x 12. '+
            'If you are not sure begin at KS1, you can change it each time you practice. At higher Key Stages, there may be different number types and problems with multiple steps.</p>'+
            '<p><em>Game Tips</em></p><p>Very happy pets sparkle and can get buffs, which are special bonuses such as extra coins. Your buffs can build up during the quiz and are listed above your player card.</p>',
        arr:[
			{ q: "Select a Key Stage...", opt:[ "KS1", "KS2", "KS3", "KS4" ], a:0, val:0 },
			{ q: "9 × 3 = ?", opt:[ "27", "28", "21", "23" ], a:0, val:27 },
			{ q: "20 ÷ 4 = ?", opt:[ "5", "8", "6", "24" ], a:0, val:5 },
			{ q: "7 × 8 = ?", opt:[ "48", "68", "56", "58" ], a:2, val:56 },
			{ q: "0.7 × 5 = ?", opt:[ "5", "3.5", "4.5", "2.5" ], a:1, val:35 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
        ]},

        continue: { name:"continue", steps:0, level:0, uid:5,
        short:'<p>Click <b>[next]</b> to practice at your chosen Key Stage or <b>[pet]</b> to interact with your pet.</p>',
        help:'<p>Click <b>[compete]</b> to test your speed and accuracy against 3 AI players.</p>'+
        '<p><em>Game Tips</em></p><p>With regular care your pet will be happy when you go into training. You can tell how your pet feels by observing its reactions when you feed or stroke it.</p>'+
        '<p>(add footer contact / link.)</p>',
		arr:[
            { q: "Ready to continue?<br>Click <b>[next]</b> or <b>[compete]</b> to train.<br>Click <b>[pet]</b> to interact with your pet.", opt:[ "options", "next", "pet", "compete" ], a:0, val:0 },
        ]},
		
        comp1: { name:"ArithMix", steps:8, level:0, uid:10, tpqmax:5,
        short:"Compete with 3 AI players on a mixture of arithmetic questions. You need to be fast and accurate to win.",
        help:"Addition, subtraction, multiplication and division may be included and target any Key Stage."+
        "Each player is ranked according to their final time. This is calculated by combining the base time"+
        "(the time taken to complete the questions), buff effects and a penalty depending on the number of wrong answers.",
		arr:[
			{ q: "Loading other players! Join a game?", opt:[ "back", "easy", "medium", "hard" ], a:0, val:0 },
			{ q: "2 × 40 = ?", opt:[ "60", "80", "24", "26" ], a:1, val:80 },
            { q: "5 + ? = 9", opt:[ "1", "4", "8", "5" ], a:1, val:4 },
            { q: "20 - ? = 9", opt:[ "11", "14", "18", "15" ], a:0, val:11 },
            { q: "2 × ¼ = ?", opt:[ "¼", "½", "¾", "1" ], a:1, val:24 },
			{ q: "100 ÷ 5 = ?", opt:[ "20", "80", "24", "25" ], a:0, val:20 },
            { q: "0.5 + ? = 0.9", opt:[ "0.1", "0.4", "0.8", "0.5" ], a:1, val:40 },
            { q: "3 ÷ 0.3 = ?<br>Round your answer to one significant figure.", opt:[ "0.7", "10", "∞", "1" ], a:1, val:33 },
			{ q: "6 × 8 = ?", opt:[ "48", "68", "56", "58" ], a:0, val:48 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
        ]},
        
        comp2: { name:"MaxMix", steps:12, level:0, uid:11, tpqmax:5,
        short:"Compete with 3 AI players on a mixture of questions from any topic or Key Stage. You need to be fast and accurate to win.",
        help:"Win a competition and you will get an award, you may also unlock new options or quiz topics such as number, measures, money, time and algebra."+
            "(Demo Version: Not all options and topics are available.)",
		arr:[
			{ q: "Loading other players! Join a game?", opt:[ "back", "easy", "medium", "hard" ], a:0, val:0 },
			{ q: "2 × ¼ = ?", opt:[ "¼", "½", "¾", "1" ], a:1, val:24 },
            { q: "Simplify √8", opt:[ "2√2", "4√2", "4", "2√4" ], a:0, val:80 },
            { q: "Evaluate 27<sup>2/3</sup>", opt:[ "7", "9", "8", "3" ], a:1, val:100 },
            { q: "50% of 360° = ?", opt:[ "120°", "130°", "180°", "100%" ], a:2, val:180 },
            { q: "10<sup>2</sup> × ? = 1", opt:[ "10<sup>2</sup>", "10<sup>-2</sup>", "10<sup>-1</sup>", "10" ], a:1, val:100 },
            { q: "Simplify 10<sup>2</sup> × 10<sup>4</sup>", opt:[ "10<sup>2</sup>", "10<sup>-2</sup>", "10<sup>6</sup>", "10<sup>8</sup>" ], a:2, val:100 },
            { q: "What is 3 squared?", opt:[ "1", "4", "8", "9" ], a:3, val:9 },
            { q: "What is the cube root of 8?", opt:[ "1", "2", "3", "4" ], a:1, val:8 },
            { q: "3 ÷ 0.3 = ?<br>Round your answer to one significant figure.", opt:[ "0.7", "10", "∞", "1" ], a:1, val:33 },
			{ q: "6 × 8 = ?", opt:[ "48", "68", "56", "58" ], a:0, val:48 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
		]},
		
        quiz3: { name:"quiz", steps:4, level:0, 
        help:'<p>Practice arithmetic quiz.</p>'+
        '<p>You get a gold star for a perfect score.</p>',
		arr:[
			{ q: "not showing this intro atm. choice of extra bufs/anything?...", opt:[ "0", "1", "2", "3" ], a:0, val:0 },
			{ q: "9 × 3 = ?", opt:[ "27", "28", "21", "23" ], a:0, val:27 },
			{ q: "20 ÷ 4 = ?", opt:[ "5", "8", "6", "24" ], a:0, val:5 },
			{ q: "5 + ? = 10", opt:[ "1", "4", "8", "5" ], a:3, val:5 },
			{ q: "7 × 8 = ?", opt:[ "48", "68", "56", "58" ], a:2, val:56 },
			{ q: "Finished!", opt:[ "reset", "next", "pet", "compete" ], a:0, val:0 },
        ]},

        quizempty: { name:"empty", steps:0, level:0,
        short:'<p>For testing only</p>',
        sprite:{ img:"url('img/npchelp.png')", clip:"rect(20px,40px,60px,0px)" }, //rect (top, right, bottom, left) 
        help:"quick jump to main menu, test level",
		arr:[
			{ q: "Ready to start?<br>Click on a box to choose a pet.", opt:[ 
                '<img width="100%" height="100%" src="img/p0.jpg">', 
                '<img width="100%" height="100%" src="img/p1.jpg">', 
                '<img width="100%" height="100%" src="img/p2.jpg">', 
                '<img width="100%" height="100%" src="img/p3.jpg">' ], 
                a:0, val:0 },   
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
            { name:"food", perish:true, buy:10, wh:[40,40], img:"imgsmall", sheet:{grp:0, frame:0, size:40}, actions:[af.feed], desc:"A portion of food, once a day is perfect." },
            { name:"bed", buy:100, wh:[70,70], img:"imgsmall", sheet:{grp:0, frame:1, size:40}, actions:[af.floor], desc:"A comfy bed for your pet." },
            { name:"flowers", buy:20, wh:[40,40], img:"imgsmall", sheet:{grp:0, frame:2, size:40}, actions:[af.floor|af.wall|af.brush], desc:"Plants can attract wildlife." },
            { name:"v-gummi", perish:true, buy:200, wh:[40,40], img:"imgsmall", sheet:{grp:0, frame:3, size:40}, actions:[af.feed], desc:"Vitamin boost in a gummy chewy treat." },
            { name:"tree", buy:100, wh:[80,150], img:"img3", actions:[af.floor|af.wall], desc:"Trees improve the environment." },
            { name:"towel", buy:30, wh:[50,50], img:"imgsmall", sheet:{grp:1, frame:0, size:40}, actions:[af.clean|af.floor|af.wall], desc:"Rub gently to clean and dry." },
            { name:"bubbles", perish:true, buy:100, wh:[40,40], img:"imgsmall", sheet:{grp:1, frame:1, size:40}, actions:[af.clean], desc:"Dissolves stubborn dirt and smells." },
            { name:"treat", perish:true, buy:20, wh:[40,40], img:"imgsmall", sheet:{grp:1, frame:2, size:40}, actions:[af.feed], desc:"A crunchy high energy snack." },
            { name:"brush", buy:100, wh:[40,40], img:"imgsmall", sheet:{grp:1, frame:3, size:40}, actions:[af.clean|af.floor|af.wall], desc:"Brushing keeps fur in good condition." },
 
            { name:"backdrop", buy:100, wh:[320,150], img:"imgwall", actions:[af.wall], desc:"test wall cover." },
            { name:"fence", buy:100, wh:[300,40], img:"imglong", actions:[af.floor|af.wall], desc:"test fence width < 320." },
            { name:"tree2", buy:100, wh:[80,150], img:"imgtall0", actions:[af.floor|af.wall], desc:"tree2." },
            
            // { name:"trophy", wh:[40,40], img:"img7", actions:[af.floor|af.wall], desc:"Award for winning a mixed topic competition." },
            // { name:"stripe", wh:[40,40], img:"img7", actions:[af.floor|af.wall], desc:"Award for winning an addition competition." },
            // { name:"badge", wh:[40,40], img:"img7", actions:[af.floor|af.wall], desc:"Award for winning a multiplication competition." },
            { name:"trophy", wh:[20,40], img:"imgaward", sheet:{grp:0, frame:0, size:40}, actions:[af.floor|af.wall], desc:"Special item for winning 5 competitions." },
            { name:"star", wh:[30,30], img:"imgaward", sheet:{grp:1, frame:0, size:40}, actions:[af.floor|af.wall], desc:"Star decoration for outstanding accuracy." },
            { name:"badge", wh:[40,40], img:"imgaward", sheet:{grp:2, frame:0, size:40}, actions:[af.floor|af.wall], desc:"Special level up item for completing 10 levels." },
        ],

        msg:[
            "Something to eat?",
            "Use an item on your pet?",
            "Hello! Today you can buy...",
            "Select an item then click somewhere to move that item.",
        ]
    };

    mpdata.spells = {
        buff: [
            { name:"+20c", c:20, desc:"Bonus: 20 extra coins."},
            { name:"+50c", c:50, desc:"Bonus: 50 extra coins."},
            { name:"+80c", c:80, desc:"Bonus: 80 extra coins."},
            { name:"+100c", c:100, desc:"Bonus: 100 extra coins."},
            { name:"+60c", c:100, desc:"Bonus: 60 extra coins."},
            //{ name:"item", mi:1, desc:"A reward item will be delivered to your pet."},

            { name:"-2s", t:-2, desc:"Bonus: Race time is faster by 2 seconds."},
            { name:"forgive1", p:-1, desc:"Bonus: One wrong answer penalty is forgiven."},
            //{ name:"sleepOP", n:50, desc:"Other player's pet sleeps, they have no extra chances."},
            { name:"+100c", c:100, desc:"Bonus: 100 extra coins."},
            { name:"-5s", t:-5, desc:"Bonus: Race time is faster by 5 seconds."},
            { name:"forgive2", p:-2, desc:"Bonus: Two wrong answers are forgiven."},
        ],
        debuff: [
            { name:"drop20", n:-20, desc:"Lose 20 coins."},
            { name:"drop50", n:-50, desc:"Lose 50 coins."},
            { name:"slow5", nt:5, desc:"Race time is slower by 5 seconds."},
            { name:"sleep", n:50, desc:"Pet sleeping, no extra chances."},
            //{ name:"elim1", f:1, desc:"Eliminated with one wrong answer."},
            //{ name:"elim3", f:3, desc:"Eliminated with three wrong answers."}, 
        ],
    };

    mpdata.txt = {
        fini: {
            rank:'<table><caption><em>Ranking<em></caption><tr><td></td><td>Pet name</td><th>Score</th><th>Base time (ms)</th><th>Final time (ms)</th></tr>',
            first:'<p>1st place! Congratulations you got an award!!!</p>',
            second:'<p>2nd place! Well played!</p>',
            third:'<p>3rd place.</p>',
            fourth:'<p>4th place.</p>',
            score:'Quiz score: ',
            penalty:'Penalty: ',
            acc:'<p>Perfect score! Well done, you earned a gold star!</p>',
            unlock:'Unlocking new quiz type:',
            help:'<p><em>Game Tip</em></p><p>When a quiz is finished, you can click your player card to see your record of achievement.</p>',
            info:'<p>Level Up!  +1c bonus  +1 star</p>',
        },
        card: {
            score:'<p>Level: Coins: Stars:   </p>', 
            stats:'<p>Average score: (%)  Pet days played: Awards: </p>', 
            comp:'<br>Competition levels:',
            prac:'<br>Practice levels:', 
            unlock: '<p>Unlocked: 1try 2try  </p>',
            opt: 'Options: sound off, music off',
            more:'<p>Create photo with pet or results certificate?</p>',
        }
    };

    mpdata.pet = [
        { name:"Puppy", col:"#ffffda", img:"url('img/p0.jpg')", sheet:null },
        { name:"Kitty", col:"#f36df8", img:"url('img/p1.jpg')", sheet:null },
        { name:"Bunny", col:"#743afc", img:"url('img/p2.jpg')", sheet:null },
        { name:"Panda", col:"#9a9c9e", img:"url('img/p3.jpg')", sheet:null },
    ];

    mpdata.npc = {
        shopkeeper: {},
        competitor: {},
        vet: {},
    };
    
    window.mpdata = mpdata;
})();