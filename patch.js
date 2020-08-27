(function() {

    function patch() {
        //this.ks = [ this.ks3, this.ks1, this.ks2, this.ks3, this.ks4 ];
    };


    patch.ks1 = {
        add:[ 
            { steps:5, pid:"to10", r:[0,10,0,1], desc:"Using numbers 0 to 10.",
            arr:[ 
                { q: "1 + 2 = ?", opt:[ "1", "2", "3", "4" ], a:2, val:3 },
                { q: "1 + 4 = ?", opt:[ "1", "4", "3", "5" ], a:3, val:5 },
                { q: "2 + 1 = ?", opt:[ "1", "2", "3", "4" ], a:2, val:3 },
                { q: "2 + 3 = ?", opt:[ "5", "2", "3", "4" ], a:0, val:5 },
                { q: "5 + 1 = ?", opt:[ "5", "6", "7", "4" ], a:1, val:6 },
            ]},
            { steps:8, pid:"to10", r:[0,10,1,3], desc:"Using numbers 0 to 10, add and subtract.",
            arr:[ 
                { q: "2 + 7 = ?", opt:[ "10", "9", "8", "7" ], a:1, val:9 },
                { q: "5 - 1 = ?", opt:[ "5", "6", "7", "4" ], a:3, val:10 },
            ]},
            { steps:8, pid:"to20", r:[0,20,1,3], desc:"Using numbers 0 to 20.",
            arr:[ 
                { q: "10 + 4 = ?", opt:[ "11", "12", "13", "14" ], a:3, val:14 },
                { q: "8 + 4 = ?", opt:[ "14", "12", "13", "15" ], a:1, val:12 },
                { q: "2 + 9 = ?", opt:[ "11", "12", "19", "18" ], a:0, val:11 },
            ]},
        ],
        mul:[
        ],
        mix:[            
        ],
    };

    patch.ks2 = {
        add:[ 
            { steps:8, pid:"to50", r:[0,50,5,11], desc:"Using numbers 0 to 50.",
            arr:[ 
                { q: "10 + 2 = ?", opt:[ "11", "12", "13", "14" ], a:1, val:15 },
            ]},
            { steps:8, pid:"to100", r:[0,100,11,15], desc:"Using numbers 0 to 100, add and subtract.",
            arr:[ 
                { q: "90 - 87 = ?", opt:[ "11", "2", "3", "4" ], a:2, val:20 },
                { q: "21 + 54 = ?", opt:[ "70", "74", "73", "75" ], a:3, val:20 },
            ]},
            { steps:8, pid:"to360", r:[0,360,15,21], desc:"Using numbers 0 to 360.",
            arr:[ 
                { q: "21 + 104 = ?", opt:[ "120", "124", "123", "125" ], a:3, val:20 },
                { q: "221 + 102 = ?", opt:[ "320", "324", "323", "325" ], a:2, val:20 },
            ]},
        ],
        mul:[
        ],
        mix:[            
        ],
    };
    patch.ks3 = {
        add:[ 
            { steps:10, pid:"to1000", r:[0,1000,73,135], desc:"Using numbers to 1000.",
            arr:[ 
                { q: "210 + 620 = ?", opt:[ "821", "820", "830", "840" ], a:2, val:30 },
            ]},
            { steps:10, pid:"to360s", r:[-360,360,23,35], desc:"Using numbers to 360, add and subtract.",
            arr:[ 
                { q: "210 + 20 = ?", opt:[ "221", "220", "230", "240" ], a:2, val:30 },
                { q: "110 - 117 = ?", opt:[ "-11", "7", "3", "-7" ], a:3, val:30 },
                { q: "360 - 90 = ?", opt:[ "170", "270", "300", "180" ], a:1, val:30 },
            ]},
        ],
        mul:[
        ],
        mix:[
        ],
    };
    patch.ks4 = {
        add:[ 
            { steps:10, pid:"+-360", r:[-360,360,31,55], desc:"Using numbers -360 to 360, add and subtract.",
            arr:[ 
                { q: "-210 + 20 = ?", opt:[ "-180", "200", "-190", "230" ], a:2, val:40 },
                { q: "360 - 91 = ?", opt:[ "179", "269", "303", "181" ], a:1, val:40 },
            ]},
            { steps:10, pid:"+-2000", r:[-2000,2000,41,339], desc:"Using numbers -2000 to 2000, add and subtract.",
            arr:[ 
                { q: "1152 - 220 = ?", opt:[ "932", "838", "1032", "1842" ], a:0, val:40 },
                { q: "-166 + 99 = ?", opt:[ "-65", "33", "-67", "264" ], a:2, val:40 },
            ]},
        ],
        mul:[
        ],
        mix:[
        ],
    };

    patch.ks = [ patch.ks3, patch.ks1, patch.ks2, patch.ks3, patch.ks4 ];


    window.mpdatapatch = patch;
})();