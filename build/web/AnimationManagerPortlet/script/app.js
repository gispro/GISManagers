Ext.onReady(function() {

    grid = Ext.create('Ext.gispro.AnimationGrid', {
        id: 'animGridPanel',
        region: "west",
        flex: 1,
        listeners : {
            select: function(grid,rec,idx) {
                editor.populate(rec.raw);
                editor.anim_id = rec.raw.anim_id;
            }
        }
    });
    
    editor = Ext.create('Ext.gispro.AnimationEditor', {
        region: "center",
        flex: 1,
        id: 'animEditPanel'
    });

    var mainPanel = Ext.create('Ext.panel.Panel', {
        title: 'Менеджер анимации',
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
                delete(editor.anim_id);
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
        autoCreateViewPort: false,
        renderTo: Ext.Element.get('mainContainer'),
        layout: "fit",
        height: "100%",
        items: [ mainPanel ]
    });
    viewPort.doLayout();
});

var  sendData  = function (record, scope) {	// commit 
    //"anim_id", " url", " title", " layers", " x_axis", " user_created", " user_modified", "date_created", "date_modified"
    if (!record) return;
    var jsondata = {
        "title"   : record.title,
        "url"     : record.url+"?service=WMS&request=GetMap",
        "x_axis"  : record.x_axis,
        "layers"  : record.layers,
        "user"    : window.JOSSO_USER
    };
    scope.anim_id && (jsondata["anim_id"] = scope.anim_id);
    OpenLayers.Request.issue({
        method: "POST",
        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=animation",
        async: true,        
        data: JSON.stringify(jsondata),
        params:{            
            action  : scope.anim_id ? "update" : "insert"            
        },
        callback: function(request) 
        {					
            handleClose.call(scope||this, request.status, scope);
        }					
    });
}

var  askForDelete  = function (rec) {
    Ext.MessageBox.show({
        title: "Удаление анимации",
        msg: "Вы действительно хотите удалить выбранную анимацию?",
        buttonText: {
            yes: "Да",
            no:  "Нет"
        },
        fn: function (btn){
            if(btn=='yes'){     
                deleteAnimation(rec.raw.anim_id);
            }
        }
    });
}

var deleteAnimation  = function (anim_id) {
    OpenLayers.Request.issue({
        method: "GET",
        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=animation",
        async: true,
        params:{
            action  : "remove",
            anim_id  : anim_id
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
        Ext.Msg.alert("Сохранение", "Анимация успешно сохранена");				
    }
    else if (code==500 || code==501) {
        Ext.Msg.alert("Сохранение", "Произошла ошибка сервера при сохранении анимации");
    }
}

var refreshGrid = function () {
    grid.getStore().reload();
    editor.reset();
}