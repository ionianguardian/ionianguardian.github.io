var time = 65;
var lvl = 1;
var bad = 0;
var sheen = 0;
var passive = 0;
var conqueror = 0;
var hydra = 0;
var witsend = 0;
var enemypra = 0;
var enemymra = 0;
var enemyhp = 1000;
var hydra_active = 0;
var baron = 0;

function pickHex(color1, color2, weight) {
    var p = weight;
    var w = p * 2 - 1;
    var w1 = (w/1+1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgb;
}

function pick_color(ratio) {
	if (ratio<0.5) {
  	color2 = [255,0,0];
    color1= [255,255,0];
    weight = ratio/0.5;
  }
  else  {
  	color2 = [255,255,0];
    color1 = [0,255,0];
    weight = ratio/0.5-1;
  }
  return pickHex( color1,color2, weight );               
}

var dynamicTable = (function() {
    
    var _tableId, _table, 
        _fields, _headers, 
        _defaultText;
    
    function _buildRowColumns(names, item) {
        var row = '<tr>';
        if (names && names.length > 0)
        {
            $.each(names, function(index, name) {
                var c = item ? item[name+''] : name;
                if ( c.split('|')[0]<=1 ) {
                	row += '<td style="width: 22% ; background-color:' + 'rgb('+ pick_color(c.split('|')[0]).join()+')">' + c  + '</td>';
                }
                else if ( c.split(' ')[1]>0 ) {
                  row += '<td style="background-color: #DDA0DD">' + c + '</td>';
                } 
                else if ( c > 1 ) {
                	row += '<td style="width: 11% ; background-color: #9678B6">' + c + '</td>';
                }	
                else 
                	row += '<td style="width: 8%">' + c + '</td>';      
            });
        }
        row += '</tr>';
        return row;
    }
    
    function _setHeaders() {
        _headers = (_headers == null || _headers.length < 1) ? _fields : _headers; 
        var h = _buildRowColumns(_headers);
        if (_table.children('thead').length < 1) _table.prepend('<thead></thead>');
        _table.children('thead').html(h);
    }
    
    function _setNoItemsInfo() {
        if (_table.length < 1) return; //not configured.
        var colspan = _headers != null && _headers.length > 0 ? 
            'colspan="' + _headers.length + '"' : '';
        var content = '<tr class="no-items"><td ' + colspan + ' style="text-align:right">' + 
            _defaultText + '</td></tr>';
        if (_table.children('tbody').length > 0)
            _table.children('tbody').html(content);
        else _table.append('<tbody>' + content + '</tbody>');
    }
    
    function _removeNoItemsInfo() {
        var c = _table.children('tbody').children('tr');
        if (c.length == 1 && c.hasClass('no-items')) _table.children('tbody').empty();
    }
    
    return {
        config: function(tableId, fields, headers, defaultText) {
            _tableId = tableId;
            _table = $('#' + tableId);
            _fields = fields || null;
            _headers = headers || null;
            _defaultText = defaultText || 'No items to list...';
            _setHeaders();
            _setNoItemsInfo();
            return this;
        },
        load: function(data, append) {
            if (_table.length < 1) return; //not configured.
            _setHeaders();
            _removeNoItemsInfo();
            if (data && data.length > 0) {
                var rows = '';
                $.each(data, function(index, item) {
                    rows += _buildRowColumns(_fields, item);
                });
                var mthd = append ? 'append' : 'html';
                _table.children('tbody')[mthd](rows);
            }
            else {
                _setNoItemsInfo();
            }
            return this;
        },
        clear: function() {
            _setNoItemsInfo();
            return this;
        }
    };
}());

// PATCH THINGS

function enemy_stats(enemy_type) {
  if (time<65)  upgrade = 1;
  else          upgrade = 1 + Math.floor((time - 65)/90);

  switch(enemy_type) {
    case 0://CHAMP
      hp = enemyhp;
      pra = enemypra;
      mra = enemymra;
      break;
    case 1://CASTER
      if (upgrade < 6) hp = 290 + 6 * upgrade;
      else hp = 320 + 8.25 * (upgrade - 5);
      pra = 0;
      mra = 0;
      break;
    case 2://MELEE
      if (upgrade < 6) hp = 455 + 22 * upgrade + 0.3 * (upgrade - 1 ) / 2 * upgrade;
      else hp = 455 + 22 * 5 + 32.25 * (upgrade - 5) + 0.3 *(upgrade - 1) / 2 * upgrade;
      if (upgrade < 6) pra = 0;
      else pra = (0.085 * (upgrade - 5 - 1) / 2 * (upgrade - 5));
      mra = 0;
      break;
    case 3://SIEGE
      if (upgrade < 6) hp = 850 + 62 * upgrade;
      else hp = 1160 + 87 * (upgrade - 5);
      pra = 0;
      mra = 0;
      break;
    case 4://SUPER
      hp = 1500 + 100 * upgrade;
      pra = 100;
      mra = 0;
}

  result = [hp,pra,mra];
  return result;
}

function print_enemy_hp(enemy_type) {
  return (Math.floor(enemy_stats(enemy_type)[0])).toFixed(0);
}

function base_q() {
  if (lvl < 4) 
    return 5; 
  else if (lvl == 4) 
    return 25; 
  else if (4 < lvl && lvl < 7)  
    return 45; 
  else if (6 < lvl && lvl <  9) 
    return 65; 
  else 
    return 85;
}

function minion_dmg(enemy_type) {
  if  (enemy_type > 0) {
    if (lvl < 4) 
      return 55;  
    else if (lvl == 4) 
      return 75;  
    else if (4 < lvl && lvl < 7)  
      return 95;  
    else if (6 < lvl && lvl <  9) 
      return 115; 
    else 
      return 135;
  }
  else 
    return 0;
}

function base_ad() {
  switch(lvl) {
    case 1:
      return 63;
    case 2:
      return 65.9;
    case 3:
      return 68.9;
    case 4:
      return 72.1;
    case 5:
      return 75.4;
    case 6:
      return 78.8;
    case 7:
      return 82.4;
    case 8:
      return 86.1;
    case 9:
      return 90;
    case 10:
      return 94;
    case 11:
      return 98.1;
    case 12:
      return 102.4;
    case 13:
      return 106.8;
    case 14:
      return 111.4;
    case 15:
      return 116.1;
    case 16:
      return 120.9;
    case 17:
      return 125.9;
    case 18:
      return 131;
  }
}

function passive_dmg(passive, conqueror, bad) {
  if ( passive == 1 )
    return 15 + 3 * (lvl - 1) + 0.25 * (bad + conqueror_ad(conqueror));
  else 
    return 0;
} 

function sheen_dmg(sheen) {
  return sheen * base_ad();
}

function witsend_dmg(witsend) {
  if (witsend == 1) {
    if (lvl < 9) 
      return 15; 
    else if (8 < lvl && lvl < 15) 
      return 25 + 10 * (lvl - 9);
    else 
      return 75 + 1.25 * (lvl - 14);
  } else 
    return 0
}

function conqueror_ad(conqueror) {
  return conqueror * (1.094 + 0.106 * lvl);
}

function ad_dmg_part(conqueror,bad) {
  return 0.6 * (base_ad()+bad + conqueror_ad(conqueror))
}

function conqueror_transform(conqueror, enemy_type) {
  if (conqueror == 5 && enemy_type == 0) {
    true_dmg_part = 0.00 * (phys_dmg_part + magic_dmg_part);
    phys_dmg_part = 1.00 * phys_dmg_part;
    magic_dmg_part = 1.00 * magic_dmg_part;
  }
}

function hydra_dmg(hydra,hydra_active) {
  if (hydra_active == 0)
    return 0;
  else if (hydra_active == 1)
    return 5 + 0.01 * hydra;
  else if (hydra_active == 2)
    return 40 + 0.1 * hydra;
}

function dmg_mult(armor) {//also applied to magic resistance
  if (armor >= 0)
    return 100/(100 + armor);
  else
    return 2 - 100/(100 - armor);
}

function damage_reduction(pra,mra) {
  if (pra >= 0)
    pra_mult = 100/(100 + pra);
  else
    pra_mult = 2 - 100/(100 - pra);

  if (mra >= 0)
    mra_mult = 100/(100 + mra);
  else
    mra_mult = 2 - 100/(100 - mra);
  
  phys_dmg_part = pra_mult * phys_dmg_part;
  magic_dmg_part = mra_mult * magic_dmg_part;
}

function baron_reduction(enemy_type,baron) {
  if (enemy_type > 0 && baron == 1) {
    if (time > 40 * 60)
      baron_red = 0.3;
    else if (time > 30 * 60) 
      baron_red = 0.42;
    else 
      baron_red = 0.5;

    phys_dmg_part = baron_red * phys_dmg_part;
    magic_dmg_part = baron_red * magic_dmg_part;
  }
}

function q_dmg(enemy_type,sheen,passive,conqueror,witsend,hydra,hydra_active,baron) {
  true_dmg_part = 0;
  phys_dmg_part = base_q() + minion_dmg(enemy_type) + ad_dmg_part(conqueror,bad) + sheen_dmg(sheen) + hydra_dmg(hydra,hydra_active);
  magic_dmg_part = passive_dmg(passive, conqueror, bad) + witsend_dmg(witsend);
  conqueror_transform(conqueror, enemy_type) ;
  damage_reduction(enemy_stats(enemy_type)[1], enemy_stats(enemy_type)[2]);
  baron_reduction(enemy_type,baron);
  result = true_dmg_part + phys_dmg_part + magic_dmg_part;
  return result;
}

function print_q_dmg(enemy_type,sheen,passive,conqueror,witsend,hydra,hydra_active,baron) {
  return (Math.floor(q_dmg(enemy_type,sheen,passive,conqueror,witsend,hydra,hydra_active,baron))).toFixed(0);
}

function perc_dmg(enemy_type,sheen,passive,conqueror,witsend,hydra,hydra_active,baron) {
  perc = q_dmg(enemy_type,sheen,passive,conqueror,witsend,hydra,hydra_active,baron) / enemy_stats(enemy_type)[0];
  if ( perc > 1 ) 
    return 1;
  else
    return perc;
}

function tad_mult(enemy_type, passive) {
  true_dmg_part = 0;
  phys_dmg_part = 0.6;
  magic_dmg_part = 0.25 * passive;
  conqueror_transform(conqueror, enemy_type);
  damage_reduction(enemy_stats(enemy_type)[1], enemy_stats(enemy_type)[2]);
  return true_dmg_part + phys_dmg_part + magic_dmg_part;  
}

function tad_needed(enemy_type,sheen,passive,conqueror,witsend,hydra,hydra_active,baron) {
  true_dmg_part = 0;
  phys_dmg_part = base_q() + minion_dmg(enemy_type) + ad_dmg_part(conqueror,-base_ad()) + sheen_dmg(sheen) + hydra_dmg(hydra,hydra_active);
  magic_dmg_part =  passive_dmg(passive,conqueror,0) + witsend_dmg(witsend);
  conqueror_transform(conqueror, enemy_type) ;  
  damage_reduction(enemy_stats(enemy_type)[1], enemy_stats(enemy_type)[2]);
  baron_reduction(enemy_type,baron);

  result = (enemy_stats(enemy_type)[0] - (true_dmg_part + phys_dmg_part + magic_dmg_part )) / tad_mult(enemy_type, passive);
  return result;
}

function print_q(enemy_type,sheen,passive,conqueror,witsend,hydra,hydra_active,baron) {
  return perc_dmg(enemy_type,sheen,passive,conqueror,witsend,hydra,hydra_active,baron).toFixed(2) + '|' + (Math.floor(tad_needed(enemy_type,sheen,passive,conqueror,witsend,hydra,hydra_active)).toFixed(0));
}

function calculate_table() {

	 data1 = [{
      champ_dmg:  print_q_dmg (0,0,0,0,0,0,0,0), 
      combo: 'q', 
      minion_dmg: print_q_dmg (1,0,0,0,0,0,0,0), 
      caster:     print_q(1,0,0,0,0,0,0,0) , 
      melee:      print_q(2,0,0,0,0,0,0,0),
      siege:      print_q(3,0,0,0,0,0,0,0) , 
    }, {
      champ_dmg:  print_q_dmg (0,0,1,0,0,0,0,0), 
      combo: 'pq', 
      minion_dmg: print_q_dmg (1,0,1,0,0,0,0,0), 
      caster:     print_q(1,0,1,0,0,0,0,0), 
      melee:      print_q(2,0,1,0,0,0,0,0),
      siege:      print_q(3,0,1,0,0,0,0,0), 
    }, {
      champ_dmg:  print_q_dmg (0,1,0,0,0,0,0,0), 
      combo: 'sq', 
      minion_dmg: print_q_dmg (1,1,0,0,0,0,0,0), 
      caster:     print_q(1,1,0,0,0,0,0,0) , 
      melee:      print_q(2,1,0,0,0,0,0,0),
      siege:      print_q(3,1,0,0,0,0,0,0) , 
    }, {
      champ_dmg:  print_q_dmg (0,1,1,0,0,0,0,0), 
      combo: 'spq', 
      minion_dmg: print_q_dmg (1,1,1,0,0,0,0,0), 
      caster:     print_q(1,1,1,0,0,0,0,0), 
      melee:      print_q(2,1,1,0,0,0,0,0),
      siege:      print_q(3,1,1,0,0,0,0,0), 
    }, {
      champ_dmg:  print_q_dmg (0,2,0,0,0,0,0,0), 
      combo: 'tq', 
      minion_dmg: print_q_dmg (1,2,0,0,0,0,0,0), 
      caster:     print_q(1,2,0,0,0,0,0,0) , 
      melee:      print_q(2,2,0,0,0,0,0,0),
      siege:      print_q(3,2,0,0,0,0,0,0) , 
    }, {
      champ_dmg:  print_q_dmg (0,2,1,0,0,0,0,0), 
      combo: 'tpq', 
      minion_dmg: print_q_dmg (1,2,1,0,0,0,0,0), 
      caster:     print_q(1,2,1,0,0,0,0,0), 
      melee:      print_q(2,2,1,0,0,0,0,0),
      siege:      print_q(3,2,1,0,0,0,0,0), 
    } 
     ];

    var dt = dynamicTable.config('main-data-table', 
                         ['champ_dmg', 'combo', 'minion_dmg', 'caster', 'melee','siege', ], 
                         ['C', '+', 'M', 'c ' + print_enemy_hp(1) , 'm ' + print_enemy_hp(2), 's ' + print_enemy_hp(3)]);

    dt.load(data1);  

    data3 = [{
      minion_dmg: print_q_dmg(1,sheen,passive,conqueror,witsend,hydra,hydra_active,baron), 
      caster: print_q(1,sheen,passive,conqueror,witsend,hydra,hydra_active,baron), 
      melee: print_q(2,sheen,passive,conqueror,witsend,hydra,hydra_active,baron), 
      siege: print_q(3,sheen,passive,conqueror,witsend,hydra,hydra_active,baron),
      super_minion: print_q(4,sheen,passive,conqueror,witsend,hydra,hydra_active,baron)},
    ];

    var dt3 = dynamicTable.config('extra-data-table', 
                         [ 'minion_dmg', 'caster', 'melee','siege', 'super_minion' ], 
                         [ 'M', 'c ' + print_enemy_hp(1) , 'm ' + print_enemy_hp(2), 's ' + print_enemy_hp(3), 'S ' + print_enemy_hp(4)]);

    dt3.load(data3);

    data4 = [{
      champ_dmg: print_q_dmg(0,sheen,passive,conqueror,witsend,hydra,hydra_active,baron), 
      champ_perc: print_q(0,sheen,passive,conqueror,witsend,hydra,hydra_active,baron),  
      champ_dmg_before_red: print_q_dmg(0,sheen,passive,conqueror,witsend,hydra,hydra_active,baron,enemypra=0,enemymra=0)
    }];

    var dt4 = dynamicTable.config('enemy-data-table', 
                         ['champ_dmg_before_red', 'champ_dmg', 'champ_perc' ], 
                         ['C before red','C after red','C % max hp']);

    dt4.load(data4);
}

calculate_table(time,lvl,bad);










$( function() {
var handle = $( "#time-handle" );
$( "#time-slider" ).slider({
  min: 65,
  max: 40*60+1,
  step: 1,
  value: 65,
  create: function() {
    handle.text( '01:05' );
  },
  slide: function( event, ui ) {
    handle.text( ("0" + Math.floor(ui.value/ 60)).slice(-2)  +':' + ("0" + ui.value% 60).slice(-2)  );
    time = ui.value;
    calculate_table();
    $( ".column #secs-input" ).val( ("0" + ui.value% 60).slice(-2) );
    $( ".column #mins-input" ).val( ("0" + Math.floor(ui.value/ 60)).slice(-2) );
  }
});
} );

$( function() {
  var secs = $("#secs-input");
  $("#mins-input").change(function () {
      var mins = parseInt( this.value  );
      if (isNaN(mins) || mins < 0) 
        mins = 0;
      value = 60*mins + parseInt(secs.val());
      text_value = ("0" + mins).slice(-2) + ':' + ("0" + secs.val()).slice(-2);
      $("#time-slider").slider("value", parseInt(value));
      $( "#time-handle" ).text( text_value);
      time = value;
      calculate_table();
  });
} );

$( function() {
  var mins = $("#mins-input");
  $("#secs-input").change(function () {
      var secs = parseInt( this.value  );
      if (isNaN(secs) || secs < 0) 
        secs = 0;
      value = 60*mins.val() + parseInt(secs);
      text_value =("0" + mins.val()).slice(-2) + ':' + ("0" + secs).slice(-2);
      $("#time-slider").slider("value", parseInt(value));
      $( "#time-handle" ).text( text_value);
      time = value;
      calculate_table();
  });
} );

$( function() {
var handle = $( "#level-handle" );
$( "#level-slider" ).slider({
  min: 1,
  max: 18,
  step: 1,
  create: function() {
    handle.text( $( this ).slider( "value" ) );
  },
  slide: function( event, ui ) {
    handle.text( ui.value );
    lvl = ui.value;
    calculate_table();
    $( "#bad-handle" ).text( bad + "|" + parseInt( bad +base_ad()) );
    $( ".column #tad-input" ).val( parseInt( bad +base_ad()) );
  }
});
} );

$( function() {
var handle = $( "#bad-handle" );
$( "#bad-slider" ).slider({
  min: 0,
  max: 300,
  step: 1,
  create: function() {
    handle.text( $( this ).slider( "value" ) + "|" + base_ad() );
  },
  slide: function( event, ui ) {
    handle.text( ui.value + "|" + parseInt(ui.value+base_ad()) );
    bad = ui.value;
    calculate_table();
    $( ".column #bad-input" ).val( ui.value );
    $( ".column #tad-input" ).val( parseInt(ui.value + base_ad()));
  }
});
} );


$("#bad-input").change(function () {
    var value = parseInt(this.value);
    if (isNaN(value)) 
      value = 0;
    $("#bad-slider").slider("value", parseInt(value));
    $( "#bad-handle" ).text( value  + "|" + parseInt(value+base_ad()) );
    $( ".column #tad-input" ).val( parseInt(value + base_ad()));
    bad = value;
    calculate_table();
});

$("#tad-input").change(function () {
    var value = parseInt(this.value) - parseInt(base_ad());
    if (isNaN(value)) 
      value = 0;
    $("#bad-slider").slider("value", parseInt(value));
    $( "#bad-handle" ).text( value  + "|" + parseInt(value+base_ad()) );
    $( ".column #bad-input" ).val( value );
    bad = value;
    calculate_table();
});

$( function() {
var handle = $( "#sheen-handle" );
$( "#sheen-slider" ).slider({
  min: 0,
  max: 2,
  step: 1,
  value: 0,
  create: function() {
    handle.text( 'No' );
  },
  slide: function( event, ui ) {
    if (ui.value == 0 )
      handle.text( 'No' );
    else if (ui.value == 1 )
      handle.text( 'Sheen' );
    else if (ui.value == 2 )
      handle.text( 'Triforce' );
    sheen = ui.value;
    calculate_table();
  }
});
} );

$( function() {
var handle = $( "#passive-handle" );
$( "#passive-slider" ).slider({
  min: 0,
  max: 1,
  step: 1,
  create: function() {
    handle.text('No');
  },
  slide: function( event, ui ) {
    if (ui.value == 0)
      handle.text('No');
    else if (ui.value == 1)
      handle.text('Yes');
    passive = ui.value;
    calculate_table();
  }
});
} );

$( function() {
var handle = $( "#conqueror-handle" );
$( "#conqueror-slider" ).slider({
  min: 0,
  max: 10,
  step: 2,
  create: function() {
    handle.text( $( this ).slider( "value" ) );
  },
  slide: function( event, ui ) {
    handle.text( ui.value );
    conqueror = ui.value;
    calculate_table();
  }
});
} );

$( function() {
var handle = $( "#witsend-handle" );
$( "#witsend-slider" ).slider({
  min: 0,
  max: 1,
  step: 1,
  create: function() {
    handle.text( 'No' );
  },
  slide: function( event, ui ) {
    if (ui.value == 0) 
      handle.text( 'No' );
    else if (ui.value == 1) 
      handle.text( 'Yes' );
    witsend = ui.value;
    calculate_table();
  }
});
} );

$( function() {
var handle = $( "#hydra-handle" );
$( "#hydra-slider" ).slider({
  min: 580,
  max: 3000,
  step: 1,
  create: function() {
    handle.text( $( this ).slider( "value" ) );
  },
  slide: function( event, ui ) {
    handle.text( ui.value );
    hydra = ui.value;
    calculate_table();
    $( ".column #hydra-input" ).val( ui.value );
  }
});
} );


$("#hydra-input").change(function () {
    var value = parseInt(this.value);
    if (isNaN(value) || value < 0) value = 0;
    $("#hydra-slider").slider("value", parseInt(value));
  $( "#hydra-handle" ).text( value );
    hydra = value;
    calculate_table();
});


$( function() {
var handle = $( "#hydra-active-handle" );
$( "#hydra-active-slider" ).slider({
  min: 0,
  max: 2,
  step: 1,
  create: function() {
    handle.text( 'No' );
  },
  slide: function( event, ui ) {
    if (ui.value == 0) 
      handle.text( 'No' );
    else if (ui.value == 1) 
      handle.text( 'Passive' );
    else if (ui.value == 2) 
      handle.text( 'Active' );
    hydra_active = ui.value;
    calculate_table();
  }
});
} );

$( function() {
var handle = $( "#baron-handle" );
$( "#baron-slider" ).slider({
  min: 0,
  max: 1,
  step: 1,
  create: function() {
    handle.text( 'No' );
  },
  slide: function( event, ui ) {
    if (ui.value == 0) 
      handle.text( 'No' );
    else if (ui.value == 1) 
      handle.text( 'Yes' );
    baron = ui.value;
    calculate_table();
  }
});
} );


$( function() {
var handle = $( "#enemypra-handle" );
$( "#enemypra-slider" ).slider({
  min: -50,
  max: 300,
  step: 1,
  create: function() {
    handle.text( $( this ).slider( "value" ) );
  },
  slide: function( event, ui ) {
    handle.text( ui.value );
    enemypra = ui.value;
    calculate_table();
    $( ".column #enemypra-input" ).val( ui.value );
  }
});
} );


$("#enemypra-input").change(function () {
    var value = parseInt(this.value);
    if (isNaN(value)) value = 0;
    $("#enemypra-slider").slider("value", parseInt(value));
  $( "#enemypra-handle" ).text( value );
    enemypra = value;
    calculate_table();
});

$( function() {
var handle = $( "#enemymra-handle" );
$( "#enemymra-slider" ).slider({
  min: -50,
  max: 300,
  step: 1,
  create: function() {
    handle.text( $( this ).slider( "value" ) );
  },
  slide: function( event, ui ) {
    handle.text( ui.value );
    enemymra = ui.value;
    calculate_table();
    $( ".column #enemymra-input" ).val( ui.value );
  }
});
} );


$("#enemymra-input").change(function () {
    var value = parseInt(this.value);
    if (isNaN(value)) value = 0;
    $("#enemymra-slider").slider("value", parseInt(value));
  $( "#enemymra-handle" ).text( value );
    enemymra = value;
    calculate_table();
});

$( function() {
var handle = $( "#enemyhp-handle" );
$( "#enemyhp-slider" ).slider({
  min: 0,
  max: 4000,
  value: 1000,
  step: 1,
  create: function() {
    handle.text( $( this ).slider( "value" ) );
  },
  slide: function( event, ui ) {
    handle.text( ui.value );
    enemyhp = ui.value;
    calculate_table();
    $( ".column #enemyhp-input" ).val( ui.value );
  }
});
} );


$("#enemyhp-input").change(function () {
    var value = parseInt(this.value);
    if (isNaN(value) || value < 0) value = 0;
    $("#enemyhp-slider").slider("value", parseInt(value));
  $( "#enemyhp-handle" ).text( value );
    enemyhp = value;
    calculate_table();
});
