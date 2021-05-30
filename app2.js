 $(function() {
        var map,
            colorscale,
            departments = {},
            w = $('#map').parent().width();

        // initialize qtip tooltip class
        $.fn.qtip.defaults.style.classes = 'ui-tooltip-bootstrap';
        $.fn.qtip.defaults.style.def = false;

        function formatDate(v){
            var vd = new Date(v);
            var days = ['Domenica','Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato'];
            return days[vd.getDay()]+' '+vd.getDate();
        }
        
        function fmt_raw(a) {
            return a+'';
        }
        
        var indicators = {
            'coprifuoco': ['Coprifuoco', fmt_raw],
            'color_region':['Zona', fmt_raw]
        },
        regionLabels={
            ITC1:'Piemonte',
            ITC2:'Val d\'Aosta',
            ITC3: 'Liguria',
            ITC4: 'Lombradia',
            ITD1: 'Bolzano',
            ITD2: 'Trento',
            ITD3: 'Veneto',
            ITD4: 'Friuli Veniezia Giulia',
            ITD5: 'Emilia Romagna',
            ITE1: 'Toscana',
            ITE2: 'Umbria',
            ITE3: 'Marche',
            ITE4: 'Lazio',
            ITF1: 'Abruzzo',
            ITF2: 'Molise',
            ITF3: 'Campania',
            ITF4: 'Puglia',
            ITF5: 'Basilicata',
            ITF6: 'Calabria',
            ITG1: 'Sicilia',
            ITG2: 'Sardegna'

        },
        
        legends={
            coprifuoco:{
                '22:00':'#D5F3FE',
                '23:00':'#66D3FA',
                ' ': '#3C99DC'
            },
            color_region:{
                'bianca':'#ffffff',
                'gialla':'#ffff00',
                'rossa': '#ff0000'
            }
        },
        icons={
            mask:{
                icon:'data:image/png;base64,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',
                data:[
                    {lon:9.1859243,lat:45.4654219,name:'ddd'}
                ]
            }
        }
        colorscales = [
            'Oranges','Reds','Blues','Greens','Purples','Greys',
            'OrRd','PuBu','BuPu','BuGn','YlOrBr','GnBu','PuRd','PuBuGn'];
        
        $.each(indicators, function(k,v) {
            $('#indicator').append('<button data-v="'+k+'">'+v[0]+'</button>');
        });
        
        $.each(colorscales, function(i,v) {
            $('#colors').append('<option>'+v+'</option>');
        });
        


        var p = [
            $.get('italy.svg').then(function(svg){
                // make sure the map fits inside browser window
			    $('#map').height($(window).height()-100);
			
                map = kartograph.map('#map');
                map.setMap(svg);
                return svg;
            })
            ,$.getJSON('data2.json')
        ];
        Promise.all(p).then(function(result){
            dataFull=result[1];
            

            var dates = Object.keys(dataFull);

            var today=new Date();
            today= today.toISOString().substr(0,10);
            var index=0;
            for(var i=0;i<dates.length;i++){
                if(dates[i]===today){
                    index=i;
                    break;
                }
            }

            dates=dates.slice(index);
            
            $.each(dates, function(k,v) {
                var val = formatDate(v)
                $('#date').append('<button data-v="'+v+'">'+val+'</button>');
            });

            for(var d in dates){
                date=dates[d];
                data=dataFull[date];
                for(var i in data){
                    $('table tbody').append(`
                    <tr class="${data[i].nuts2} ${date}">
                    <td>${(regionLabels[data[i].nuts2]||data[i].nuts2)}</td>
                    <th scope="row">${formatDate(date)}</th>
                    <td>${data[i].color_region}</td>
                    <td>${data[i].coprifuoco}</td>
                    </tr>`);
                }
            }
            var filterTable = function(options){
                var v='';
                if(options.region){
                    v+='.'+options.region;
                }
                if(options.date){
                    v+='.'+window._date;
                }
                $('#report table tbody tr').hide();
                $('#report table tbody tr'+v).show();
            };


                
                
                var dataMap;

                var updateDate= function(date){
                    window._date=date;
                    var data = dataFull[window._date];
                    dataMap={}
                    for(var i in data){
                        dataMap[data[i].nuts2]=data[i];
                    }
                    map.getLayer('regions').style('fill', function(d) {
                        dd=dataMap[d.nuts2];
                        if (dd == null) return '#0ff0ff';
                        if(legends[prop]){
                            return legends[prop][dd[prop]];
                        } else if(dd[prop+'_color']){
                            return dd[prop+'_color']
                        }
                        return '#000000';
                    });
                    filterTable({date:window._date});
                }

                var updateMap = function(){
                    q=new Date();
                    date= window._date || q.toISOString().substr(0,10);
                    prop= window._ind||'color_region';
                    var _indicator=prop;
                    prop_fmt = indicators[prop][1]

                    data = dataFull[date];
                    var dataMap={}
                    for(var i in data){
                        dataMap[data[i].nuts2]=data[i];
                    }
                    var reportMap={}
                    for(var d in dates){
                        date=dates[d];
                        var dd=dataFull[date];
                        for(var i in dd){
                            reportMap[dd[i].nuts2]=reportMap[dd[i].nuts2]||'';
                            reportMap[dd[i].nuts2]+=`
                            <tr>
                            <th scope="row">${formatDate(date)}</th>
                            <td class="colorRegion-${dd[i].color_region}">${dd[i].color_region}</td>
                            <td>${dd[i].coprifuoco}</td>
                            </tr>
                            `;
                        }
                    }

                    map.clear();
                                       
                    // update legend
                    var i,v,c,r,leg = $('#legend');
                    leg.html('');	
                    if(legends[prop]){
                        for(var lab in legends[prop]){
                            leg.append('<div class="legendLabel" style="background:'+legends[prop][lab]+'">'+lab+'&nbsp;</div>');
                        }
                    }
                    map.addLayer('regions', {
                       data:data,
                       key:'nuts2',
                        styles: {
                            'stroke-width': 0.7,
                            fill: function(d) {
                                dd=dataMap[d.nuts2];
                                if (dd == null) return '#0ff0ff';
                                if(legends[prop]){
                                    return legends[prop][dd[prop]];
                                } else if(dd[prop+'_color']){
                                    return dd[prop+'_color']
                                }
                                return '#000000';
                            },
                            stroke: function(d) { return '#000'; }
                        },
                        click: function(d) {
                            filterTable({region:d.nuts2});
                         },
                        tooltips: function(d) {
                            return `<table class="tooltipTable">
                            <thead class="thead-light">
                                <tr>
                                <th scope="col">Data</th>
                                <th scope="col">Zona</th>
                                <th scope="col">Coprifuoco</th>
                                </tr>
                            </thead>
                            <tbody>${reportMap[d.nuts2]}</tbody></table>`;
                        }
                    });

                    /*map.addSymbols({
                        type: kartograph.Icon,
                        data: icons['mask'].data,
                        location: function(city) { return [city.lon, city.lat] },
                        icon: icons['mask'].icon,
                        click: function(city) {
                           console.log(city.name);
                        }
                     });*/

                     map.addSymbols({
                        type: kartograph.Label,
                        data: map.getLayer('regions').getPathsData(),
                        location: function(d) {
                            return 'regions.' + d.nuts2;
                        },
                        text: function(d) {
                            return dataMap[d.nuts2].coprifuoco;
                        }
                    });
                };
                updateMap();
			    $('#indicator button').click(function(e){
                    var p = e.target.dataset.v;
                    window._ind=p;
                    updateMap();
                });
                $('#date button').click(function(e){
                    $('#date button').removeClass('active');
                    $(e.target).addClass('active');
                    var p = e.target.dataset.v;
                    updateDate(p);
                });
        });
    });