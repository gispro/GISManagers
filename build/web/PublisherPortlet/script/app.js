Ext.onReady(function() {

    grid = Ext.create('Ext.gispro.PublisherGrid', {
        id: 'publGridPanel',
        region: "west",
        flex: 1,
        listeners : {
            select: function(grid,rec,idx) {
                editor.populate(rec.raw);
                editor.selectedId = rec.raw.id;
                rec.raw.publishedonce = rec.raw.publishedonce || "f";
                Ext.getCmp('publishButton').setText(rec.raw.publishedonce=="f"?"Опубликовать":"Обновить");
                Ext.getCmp('publishButton').enable();                
            }
        }
    });
    
    editor = Ext.create('Ext.gispro.PublisherEditor', {
        region: "center",
        flex: 1
    });
    
    logPanel = Ext.create('Ext.gispro.ProcessLogGrid',{
        region:"center"
    });
    
    logWindow = Ext.create('Ext.window.Window', {
        id: 'processLogWindow',
        width: 900,
        height: 500,
        closeAction: 'hide',
        title: "Мониторинг публикации",
        items: [logPanel],
        layout: {
            type:'border', 
            align:'stretch'
        }
    });

    var mainPanel = Ext.create('Ext.panel.Panel', {
        title: 'Менеджер публикации',
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
                delete(editor.selectedId);
                Ext.getCmp('publishButton').setText("Опубликовать");
            }            
        },{
            text: "Сохранить",
            handler: function(){
                var str = [];
                var correct = true;
                if (!Ext.getCmp('resourceid').getValue()) {
                    correct=false;
                    str.push("Ид.ресурса");
                }
                if (!Ext.getCmp('workspace').getValue()) {
                    correct=false;
                    str.push("Рабочая область");
                }
                if (!Ext.getCmp('title').getValue()) {
                    correct=false;
                    str.push("Заголовок");
                }
                if (!Ext.getCmp('type').getValue()) {
                    correct=false;
                    str.push("Тип геометрии");
                }
                if (!Ext.getCmp('defaultstyle').getValue()) {
                    correct=false;
                    str.push("Стиль по умолчанию");
                }
                if (Ext.getCmp('type').getValue()!="pt" && !Ext.getCmp('param').getValue()) {
                    correct=false;
                    str.push("Параметр");
                }                
                if  (correct) {
                    sendData(editor.getState(), editor);
                } else {
                    Ext.Msg.alert("Ошибка", "Не заполнены обязательные поля: " + str.join (", "));
                }
            }
        },{
            text: "Удалить",
            handler: function() {
                var rec = grid.getSelectedRecord();
                askForDelete(rec, this);
            }
        },
        new Ext.Toolbar.Spacer(),
        {
            text: "Опубликовать",
            id: 'publishButton',
            disabled: true,
            handler: function() {
                var processid = new Date().getTime();
                var jsondata = {
                    "processid": processid,
                    "id":editor.getRecordId(),
                    "resourceid": editor.getResourceid(),
                    "param": editor.getParam(),
                    "type": editor.getType()      
                };
                OpenLayers.Request.issue({
                    method: "POST",
                    url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=publisher",
                    async: true,        
                    data: JSON.stringify(jsondata),
                    params:{            
                        action  : "processResource"            
                    },
                    success: function(request) 
                    {					
                        var res;
                        try {
                            res = JSON.parse(request.responseText)
                        }catch(e) {
                            logWindow.setLoading(true);
                        }
                        if (!res || res.publishResult=="Error") {
                            Ext.Msg.alert("Публикация ресурса","Во время публикации произошла ошибка");
                        } else if (res.error){
                            var w = new Ext.Window({
                                title:'Ошибка',
                                width: 350,
                                //height:150,
                                autoHeight: true,
                                bodyStyle: "padding:10px",
                                html: "Во время запуска публикации произошла ошибка",
                                buttons: [
                                {
                                    text: "OK", 
                                    handler: function(){ 
                                        w.close();
                                    }
                                },
                                {
                                    text: "Подробнее...", 
                                    handler: function(){ 
                                        w.close();
                                        Ext.Msg.show({
                                            title:'Подробная информация:',
                                            width: 700,
                                            msg:  res.error 
                                        });
                                    }
                                },
                                ]
                            }).show();
                        } else if (res.publishResult == "OK" ){
                            Ext.Msg.alert("Публикация ресурса","Ресурс успешно опубликован");
                        }
                        logWindow.items.getRange()[0].reconfigure(Ext.create('Ext.data.Store', {
                            model: 'processLogModel',
                            autoLoad: true,
                            proxy: {
                                type: 'ajax',
                                url:  CONFIG.PROXY + CONFIG.OVROOT+'services?service=processLog&action=getSingle&processid='+processid,
                                reader: {
                                    type: 'json',
                                    root: 'items'
                                }
                            },
                            listeners : {
                                load : function () {
                                    logWindow.setLoading(false);
                                    this.sort({
                                        property : 'datestart',
                                        direction: 'DESC'
                                    });
                                }
                            }
                        }));
                    },
                    failure : function(request){
                        Ext.Msg.alert("Публикация ресурса","Во время публикации произошла ошибка. \nСообщение сервера: \""+JSON.parse(request.responseText.trim())["error"]+"\"");
                    }
                });
                logWindow.items.getRange()[0].getStore().removeAll();
                logWindow.show();
                logWindow.setLoading(true);
            }
        },
        {
            text: "Опубликовать все",
            hidden: true,
            handler : function(){
                Ext.MessageBox.show({
                    title: "Публикация",
                    msg: "Публикация всех записей может занять длительное время. Вы уверены?",
                    buttonText: {
                        yes: "Да",
                        no:  "Нет"
                    },
                    fn: function (btn){
                        if(btn=='yes'){     
                            OpenLayers.Request.issue({
                                method: "POST",
                                url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=publisher",
                                async: true,        
                                data: JSON.stringify(jsondata),
                                params:{            
                                    action  : "processAll"            
                                },
                                callback: function(request) {
                                    var store = logWindow.items.getRange()[0].items.getRange()[0].getStore();
                                    store.clearFilter();                                   
                                    logWindow.show();
                                },
                                success: function(request) 
                                {					
                                    var res = JSON.parse(request.responseText);
                                    if (res.publishResult== "OK") {
                                        Ext.Msg.alert("Публикация","Публикация ресурсов успешно завершена")
                                    } else if (res.errors.length==0) {
                                        Ext.Msg.alert("Публикация ресурса","Во время публикации произошла ошибка: "+ res.error);
                                    } else {
                                        Ext.Msg.alert("Публикация ресурса","Во время публикации следующих ресурсов произошли ошибки: \r\n" + res.errors.join(",") );
                                    }

                                },
                                failure : function(request){
                                    Ext.Msg.alert("Публикация ресурса","Во время публикации произошла ошибка. \nСообщение сервера: \""+JSON.parse(request.responseText.trim())["error"]+"\"");
                                }
                            });
                        }
                    }
                });
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
    Ext.getCmp("type").select("pt");
});

var  sendData  = function (record, scope) {	// commit 
    //"id", " url", " title", " layers", " x_axis", " user_created", " user_modified", "date_created", "date_modified"
    if (!record) return;
    var jsondata = editor.getState();    
    scope.selectedId && (jsondata.id = scope.selectedId);
    OpenLayers.Request.issue({
        method: "POST",
        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=publisher",
        async: true,        
        data: JSON.stringify(jsondata),
        params:{            
            action  : scope.selectedId ? "update" : "insert"            
        },
        callback: function(request) 
        {					
            handleClose.call(this, request.status, request);
        }					
    });
}

var  askForDelete  = function (rec) {
    Ext.MessageBox.show({
        title: "Удаление",
        msg: "Вы действительно хотите удалить выбранную запись?",
        buttonText: {
            yes: "Да",
            no:  "Нет"
        },
        fn: function (btn){
            if(btn=='yes'){     
                deletePublisher(rec.raw.id);
            }
        }
    });
}

var deletePublisher  = function (id) {
    OpenLayers.Request.issue({
        method: "GET",
        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=publisher",
        async: true,
        params:{
            action  : "remove",
            id  : id
        },
        success: function(request) 
        {					
            refreshGrid();
        },
        failure: function(request) {
            Ext.Msg.alert("Сохранение", "Произошла ошибка сервера при удалении записи. \nСообщение сервера: \""+JSON.parse(request.responseText.trim())["error"]+"\"");
        }
    });
}

var handleClose  = function (code,request) {
    if (code===200) {				
        var res;
        try {
            res = JSON.parse(request.responseText);
        } catch (e) {
            
        }
        if (res && res.result == "OK") {
            Ext.Msg.alert("Публикация ресурса","Запись успешно сохранена");
            editor.reset();
            refreshGrid.call(this);
        }else {
            var w = new Ext.Window({
                title:'Ошибка',
                width: 350,
                //height:150,
                autoHeight: true,
                bodyStyle: "padding:10px",
                html: "Во сохранения записи произошла ошибка",
                buttons: [
                {
                    text: "OK", 
                    handler: function(){ 
                        w.close();
                    }
                },
                {
                    text: "Подробнее...", 
                    handler: function(){ 
                        w.close();
                        Ext.Msg.show({
                            title:'Подробная информация:',
                            width: 700,
                            msg:  (res && res.error) || request.responseText
                        });
                    }
                },
                ]
            }).show();
        //Ext.Msg.alert("Публикация ресурса","Во сохранения записи произошла ошибка");				
        }
    }
    else if (code==500 || code==501) {
        Ext.Msg.alert("Сохранение", "Произошла ошибка сервера при сохранении записи. \nСообщение сервера: \""+JSON.parse(request.responseText.trim())["error"]+"\"");
    }
}

var refreshGrid = function () {
    grid.getStore().reload();
}

var setLayerName = function(resourceid, param, type, resField) {
    OpenLayers.Request.issue({
        method: "POST",
        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=publisher",
        async: true,
        params:{
            action  : "getLayerName"
        },
        data : JSON.stringify({
            "resourceid":resourceid||"",
            "param":param||"",
            "type":type||""
        }),
        success: function(request) 
        {					
            var res;
            try {
                res = JSON.parse(request.responseText); 
            }                
            finally {
                if (res && res.layername) {
                    resField.setValue(res.layername);
                }
            }
        },
        failure: function(request) {
        //Ext.Msg.alert("Сохранение", "Произошла ошибка сервера при удалении записи. \nСообщение сервера: \""+JSON.parse(request.responseText.trim())["error"]+"\"");
        }
    });
}

var setParamsList = function(resourceid) {
    OpenLayers.Request.issue({
        method: "GET",
        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=publisher",
        async: true,
        params:{
            action  : "getParams",
            resourceid: resourceid
        },
        success: function(request) 
        {					
            var res;
            try {
                res = JSON.parse(request.responseText); 
                
            }                
            finally {
                if (res && res.layers) {
                    var layersarr = [];
                    res.layers.forEach(function(el){
                        layersarr.push({
                            name:el
                        })
                    });
                    paramsStore.removeAll();
                    paramsStore.add (layersarr);
                }
            }
        },
        failure: function(request) {
        //Ext.Msg.alert("Сохранение", "Произошла ошибка сервера при удалении записи. \nСообщение сервера: \""+JSON.parse(request.responseText.trim())["error"]+"\"");
        }
    });
}


var setWorkspace = function(resourceid, wsField) {
    OpenLayers.Request.issue({
        method: "GET",
        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=publisher",
        async: true,
        params:{
            action  : "getWorkspace",
            resourceid  : resourceid
        },
        success: function(request) 
        {					
            var res;
            try {
                res = JSON.parse(request.responseText); 
                
            }                
            finally {
                res && res.workspace && wsField.setValue(res.workspace);
            }
        },
        failure: function(request) {
        //Ext.Msg.alert("Сохранение", "Произошла ошибка сервера при удалении записи. \nСообщение сервера: \""+JSON.parse(request.responseText.trim())["error"]+"\"");
        }
    });
}