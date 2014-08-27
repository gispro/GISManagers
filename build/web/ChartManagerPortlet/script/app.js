Ext.onReady(function() {

    grid = Ext.create('Ext.gispro.ChartGrid', {
        id: 'chartGridPanel',
        region: "west",
        flex: 1,
        listeners : {
            select: function(grid,rec,idx) {
                editor.populate(rec.raw);
                editor.chart_id = rec.raw.chart_id;
            }
        }
    });
    
    editor = Ext.create('Ext.gispro.ChartEditor', {
        flex: 1,
        region: "center",
        id: 'chartEditPanel'
    });

    mainPanel = Ext.create('Ext.panel.Panel', {
        title: 'Менеджер графиков',
        split: true,
        layout: {
            type:'border', 
            align:'stretch'        
        },
        defaults: {
            split: true
        },
        items: [
        grid, editor
        ],
        tbar: [{
            text: "Новый",
            handler: function(){
                editor.reset();
                delete(editor.chart_id);
            }            
        },{
            text: "Сохранить",
            handler: function(){
                sendData(editor.getState(), editor);
            }
        },{
            text: "Удалить",
            handler: function() {
                var rec = grid.getSelectedRecord();
                askForDelete(rec, this);
            }
        }]
        
    });
    var viewPort = new Ext.Panel({
        renderTo: 'mainContainer',
        layout: "fit",
        height: "100%",
        items: [ mainPanel ]
    });
    viewPort.doLayout();
});


var  sendData  = function (record, scope) {	// commit 
    //"chart_id", " url", " title", " layers", " x_axis", " user_created", " user_modified", "date_created", "date_modified"
    if (!record) return;
    var jsondata = {
        "title"   : record.title,
        "url"     : record.url,
        "x_axis"  : record.x_axis || "" ,
        "y_axis"  : record.y_axis || "" ,
        "layers"  : record.layers,
        "user"    : window.JOSSO_USER
    };
    scope.chart_id && (jsondata.chart_id = scope.chart_id);
    OpenLayers.Request.issue({
        method: "POST",
        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=charts",
        async: true,        
        data: JSON.stringify(jsondata),
        params:{            
            action  : scope.chart_id ? "update" : "insert"            
        },
        callback: function(request) 
        {					
            handleClose.call(scope||this, request.status, scope);
        }					
    });
}

var  askForDelete  = function (rec) {
    Ext.MessageBox.show({
        title: "Удаление графика",
        msg: "Вы действительно хотите удалить выбранный график?",
        buttonText: {
            yes: "Да",
            no:  "Нет"
        },
        fn: function (btn){
            if(btn=='yes'){     
                deleteChart(rec.raw.chart_id);
            }
        }
    });
}

var deleteChart  = function (chart_id) {
    OpenLayers.Request.issue({
        method: "GET",
        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=charts",
        async: true,
        params:{
            action  : "remove",
            chart_id  : chart_id
        },
        callback: function(request) 
        {					
            refreshGrid();
        }					
    });
}

var handleClose  = function (code) {
    if (code===200) {				
        refreshGrid.call(this);
        Ext.Msg.alert("Сохранение", "График успешно сохранен");				
    }
    else if (code==500 || code==501) {
        Ext.Msg.alert("Сохранение", "Произошла ошибка сервера при сохранении графика");
    }
}

var refreshGrid = function () {
    grid.getStore().reload();
    editor.reset();
}

var setDefault = function(rowIdx) { 
    for(var index=0; index<chartStore.data.items.length; index++) 
    { 
        if(chartStore.data.items[index].data.is_default) 
        {							
            chartStore.data.items[index].set('is_default',false);    
        }
    } 
    chartStore.data.items[rowIdx].set('is_default',true); 				
    grid.chart_id = chartStore.data.items[rowIdx].get('chart_id');
    storeSetDefault(grid.chart_id);
}

var storeSetDefault = function (chartId) {
    OpenLayers.Request.issue({
        method: "GET",
        url: CONFIG.PROXY + CONFIG.OVROOT + "services",
        async: true,
        params:{
            service : "charts",
            action  : "updateDefault",
            chart_id : chartId
        },
        callback: function(resp) 
        {					
            var str = resp;
        }					
    });
}