Ext.require([
    'Ext.data.writer.Json',
    'GeoExt.data.reader.WmsCapabilities',
    'GeoExt.data.WmsCapabilitiesLayerStore'
    ]);

servicesSetting = {
    showMessage : function(msg, verbose) {
        var w = new Ext.Window({
            title:'Ошибка',
            width: 350,
            //height:150,
            autoHeight: true,
            bodyStyle: "padding:10px",
            html: msg,
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
                        msg:  verbose
                    });
                }
            },
            ]
        }).show();
    }
};

Ext.define('Ext.gispro.ServiceSettings', {
    extend: 'Ext.panel.Panel',
    title        : 'Менеджер сервисов',
    layout       : 'fit',
    newObject    : false,
    user         : '',
    doubledRSS   : 'RSS с данным URL присутствует в списке',
    buttonAlign  : 'left',
    tbar: [
    {
        disabled : false,  
        text     : 'Новый',
        id       : 'newButton',
        handler  : function(){  
            servicesSetting.newObject = true;
            if (Ext.getCmp('servicesSettingsPanel').tabs.activeTab.id === 'wmsPanel') {
                servicesSetting.wmsPanel.clear();
            //                servicesSetting.lockControl ("wmsAccessSelector", false);
            } else if (Ext.getCmp('servicesSettingsPanel').tabs.activeTab.id === 'arcgisPanel') {
                servicesSetting.arcgisPanel.clear();
            //                servicesSetting.lockControl ("arcgisAccessSelector", false);
            } else if (Ext.getCmp('servicesSettingsPanel').tabs.activeTab.id === 'rssPanel') {
                servicesSetting.rssPanel.clear();
            //                servicesSetting.lockControl ("rssAccessSelector", false);
            }
        //            servicesSetting.buttons[4].setDisabled (true );
        } 
    },
    {
        disabled : true,
        text     : 'Сохранить',
        id		 : 'saveButton',
        handler  : function(){
            if (Ext.getCmp('servicesSettingsPanel').tabs.activeTab.id === 'wmsPanel') {
                //					console.log ('Save WMS object : newObject = ' + servicesSetting.newObject);
                if (servicesSetting.newObject === false)
                    servicesSetting.wmsPanel.saveSelected();
                else
                    servicesSetting.wmsPanel.addRecord();
                wmsStore.reload();
            } else if (Ext.getCmp('servicesSettingsPanel').tabs.activeTab.id === 'arcgisPanel') {
                if (servicesSetting.newObject === false)
                    servicesSetting.arcgisPanel.saveSelected();
                else
                    servicesSetting.arcgisPanel.addRecord();
                //console.log ('Save ARCGIS object : newObject = ' + servicesSetting.newObject);
                arcgisStore.reload();
                Ext.getCmp('arcgisGrid').getView().refresh();
            } else if (Ext.getCmp('servicesSettingsPanel').tabs.activeTab.id === 'rssPanel'){
                if (servicesSetting.newObject === false)
                    servicesSetting.rssPanel.saveSelected();
                else
                    servicesSetting.rssPanel.addRecord();
                rssStore.reload();
            }
        }  
    },
    {
        disabled : true,
        text     :'Удалить',
        id		 : 'deleteButton',
        handler  : function(){
            if ((Ext.getCmp('servicesSettingsPanel').tabs.activeTab.id === 'wmsPanel') && (servicesSetting.newObject === false)) {
                // console.log ('Delete WMS object : newObject = ' + servicesSetting.newObject);
                servicesSetting.wmsPanel.removeSelected();
            } else if ((Ext.getCmp('servicesSettingsPanel').tabs.activeTab.id === 'arcgisPanel') && (servicesSetting.newObject === false)) {
                console.log ('Delete ARCGIS object : newObject = ' + servicesSetting.newObject);
                servicesSetting.arcgisPanel.removeSelected();
            } else if ((Ext.getCmp('servicesSettingsPanel').tabs.activeTab.id === 'rssPanel') && (servicesSetting.newObject === false)){
                servicesSetting.rssPanel.removeSelected();
            }
        }
    }
    ],  
    initComponent: function() {
        //~~ WMS layer store ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.wmsLayersStore = new Ext.data.Store({
            autoLoad : false,
            idCustom : '',
            proxy    : new Ext.data.HttpProxy({
                url : ''
            }),
            reader: new Ext.data.XmlReader({
                record : 'Layer',
                id     : 'Layer'
            }, [ 'Title', 'Name']),
            listeners :
            {
                load   : function() {
                    Ext.getCmp('wmsLayersCount').getEl().update(' Количество слоев ' + this.data.length);
                },
                loadexception : function(o, arg, nul, e) {
                    console.log ('ServiceSetting.wmsLayersStore.loadexception : ' + e);
                }
            }
        });
        //~~ icon store ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.iconStore = new Ext.data.SimpleStore({
            fields: ['color', 'url'],
            data : [['голубой'   , 'script/images/marker-blue.gif'  ],
            ['коричневый', 'script/images/marker-brown.gif' ],
            ['желтый'    , 'script/images/marker-gold.png'  ],
            ['зеленый'   , 'script/images/marker-green.png' ],
            ['фиолетовый', 'script/images/marker-purple.gif'],
            ['красный'   , 'script/images/marker-red.png'   ]]
        });
        this.iconSelector = new Ext.form.ComboBox({
            fieldLabel    : "Иконка",
            emptyText     : "Введите или выберите иконку для RSS",
            displayField  : 'color',
            valueField    : 'url',
            editable      : true,
            disabled      : false,
            triggerAction : 'all',
            mode          : 'local',
            store         : this.iconStore,
            anchor        : "100%",
            labelStyle    : 'font-size:12px;font-weight: normal; color:#909090'
        });
        //~~ acess store ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~		
        this.accessStore = new Ext.data.SimpleStore({
            fields : ['rus', 'eng'],
            data   : [['Открыт'      , 'public' ],
            ['Закрыт'      , 'private'],
            ['Ограниченный', 'limited']]
        });
       
        //~~ ArcGIS Store ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        var arcgisDS = new Ext.data.JsonStore({
            root      : 'servers',
            fields : ['id', 'title', 'url', 'format', 'owner', 'access']
        });
        //        arcgisDS.loadData(arcgisStore.reader.jsonData);
		
        this.lockControl = function(selector, disabled)
        {
            servicesSetting.buttons[3].setDisabled (disabled);
            servicesSetting.buttons[4].setDisabled (disabled);
        //Ext.getCmp(selector)      .setDisabled (disabled);
        };
        //~~~ Messages
        this.doubledRecord = function(content)
        {
            Ext.Msg.alert('Дублирование', content);
        };
        this.errorTransaction = function()
        {
            Ext.Msg.alert('Ошибка', 'Ошибка при обработке записи на сервере');
        };
        this.errorFieldEmpty = function()
        {
            Ext.Msg.alert('Сохранение', 'Одно или несколько полей не заполнены');
        };
        this.notSelected = function()
        {
            Ext.Msg.alert('Добавление на карту', 'Не выделена ни одна запись');
        };
        //~~ WMS panel start ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        servicesSetting.wmsPanel = this.wmsPanel = new Ext.Panel({
            id: 'wmsPanel',
            title: 'WMS',
            layout: {
                type: 'vbox', 
                align:'stretch'
            },
            getSelectedRow : function (store, data)
            {
                var row = -1;
                if (store.getCount() > 0)
                {
                    for (var i = 0; i < store.getCount(); i++)
                    {
                        if ((store.data.items[i].data.title === data.title) &&
                            (store.data.items[i].data.url   === data.url))
                            {
                            row = i;
                            break;
                        };
                    };
                };
                return row;
            },
            clear : function()
            {
                Ext.getCmp("serverNameField").setValue('');
                Ext.getCmp("serverURLField").setValue('');
                Ext.getCmp("serverRestURLField").setValue('');
                Ext.getCmp("workspaceField").setValue('');
                Ext.getCmp("activeField").setValue(true);
                Ext.getCmp("registeredField").setValue(true);
                Ext.getCmp("srbd_idField").setValue('');
                Ext.getCmp("saveButton").enable();
                //Ext.getCmp("wmsPanel").items.items[1].items.items[2].setValue(servicesSetting.user);
                //Ext.getCmp("wmsPanel").items.items[1].items.items[3].setValue('public');
                //Ext.getCmp("wmsAccessSelector").setDisabled (false);
				
                if ((Ext.getCmp("wmsGrid").store.getCount() > 0) && Ext.getCmp("wmsGrid").getSelectionModel().getSelection()[0])
                {
                    Ext.getCmp("wmsGrid").getSelectionModel().deselectAll();
                //                    Ext.getCmp("wmsGrid").getSelectionModel().deselectRow(this.getSelectedRow(Ext.getCmp("wmsGrid").store, 
                //                        Ext.getCmp("wmsGrid").getSelectionModel().getSelection()[0].data));
                }
            },                                
            rowSelect : function (i)
            {
                Ext.getCmp("serverNameField").setValue(wmsStore.getAt(i).data.server_name);
                Ext.getCmp("serverURLField").setValue(wmsStore.getAt(i).data.url);
                Ext.getCmp("serverRestURLField").setValue(wmsStore.getAt(i).data.rest_url);
                Ext.getCmp("workspaceField").setValue(wmsStore.getAt(i).data.workspace);
                Ext.getCmp("activeField").setValue(wmsStore.getAt(i).data.active);
                Ext.getCmp("registeredField").setValue(wmsStore.getAt(i).data.registered);
                Ext.getCmp("srbd_idField").setValue(wmsStore.getAt(i).data.srbd_id);
                Ext.getCmp("user_created_wms").setValue(wmsStore.getAt(i).data.user_created);
                Ext.getCmp("date_created_wms").setValue(wmsStore.getAt(i).data.date_created);
                Ext.getCmp("saveButton").enable();
                Ext.getCmp("deleteButton").enable();
                //Ext.getCmp("wmsPanel").items.items[1].items.items[2].setValue(record.data.owner     );
                //Ext.getCmp("wmsPanel").items.items[1].items.items[3].setValue(record.data.access    );
				
                //var disabled = true;
                if (wmsStore.getAt(i).data.owner === servicesSetting.user) 
                    disabled = false;
                //                servicesSetting.lockControl ("wmsAccessSelector", disabled);
                servicesSetting.newObject = false;				                
                
                // load caps from toc
                var source = wmsStore.getById(wmsStore.getAt(i).data.id);                              
                Ext.getCmp("wmsLayers").setLoading(true);
                var capsStore = new GeoExt.data.WmsCapabilitiesStore({
                    url: CONFIG.PROXY_REMOTE + source.raw.url + "/wms?service=wms&version=1.3.0&request=getcapabilities",
                    autoLoad : true,
                    listeners: {
                        load : function(store,records,status) {                   
                            handleCapabilities(source.raw.url,capsStore,function() {
                                Ext.getCmp("wmsLayers").setLoading(false);
                                if (records.length!=0) {
                                    records.forEach(function(record){
                                        record.set('layername', record.get('name'));
                                        record.set('nodename', record.get('title'));
                                    });
                                }
                                Ext.getCmp("wmsLayers").getStore().loadData(capsStore.getRange());
                                Ext.getCmp("wmsLayers").getView().focusRow(0);  
                            });
                        }
                    }
                });
            },
            removeSelected : function()
            {
                var idx = this.getSelectedRow(Ext.getCmp("wmsGrid").store, 
                    Ext.getCmp("wmsGrid").getSelectionModel().getSelection()[0].data);
                var record = Ext.getCmp("wmsGrid").store.data.items[idx];

                Ext.MessageBox.show({
                    title: "Удаление WMS",
                    msg: "Вы действительно хотите удалить выбранный сервис?",
                    buttonText: {
                        yes: "Да",
                        no:  "Нет"
                    },
                    fn: function (btn){
                        if(btn=='yes'){     
                            OpenLayers.Request.issue({
                                method: "GET",
                                url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=wms",
                                async: true,
                                params:{                     
                                    action  : "remove",
                                    id	    : record.data.id
                                },
                                callback: function(request) 
                                {
                                    var result;
                                    try {
                                        result = JSON.parse(request.responseText);
                                    } catch(e) {
                                
                                    }
                                    if (result && result.result== "OK" )
                                    {								
                                        servicesSetting.wmsPanel.clear();
                                        Ext.getCmp("wmsGrid").store.remove (record); 
                                    } else {
                                        servicesSetting.showMessage("Ошибка при удалении WMS-сервиса", result && result.error || request.responseText);
                                    }                       
                                }					
                            });               
                        }
                    }
                });
            },
            saveSelected : function()
            {
                var idx = this.getSelectedRow(Ext.getCmp("wmsGrid").store, 
                    Ext.getCmp("wmsGrid").getSelectionModel().getSelection()[0].data);
                var panel  = Ext.getCmp("wmsPanel").items.items[1];
                var record = Ext.getCmp("wmsGrid" ).store.data.items[idx];

                if ((Ext.getCmp("serverNameField").getValue().length === 0) || (Ext.getCmp("serverURLField").getValue().length === 0)) 
                {
                    servicesSetting.errorFieldEmpty();
                }
                else if ((record.data.title  !== Ext.getCmp("serverNameField").getValue()) ||
                    (record.data.url    !== Ext.getCmp("serverURLField").getValue()))
                    {
                    var doubled = false;
                    var jsondata = {
                        id     		   : record.data.id,
                        server_name    : Ext.getCmp("serverNameField").getValue(),
                        url            : Ext.getCmp("serverURLField").getValue(),
                        rest_url       : Ext.getCmp("serverRestURLField").getValue(),
                        workspace       : Ext.getCmp("workspaceField").getValue(),
                        active       : Ext.getCmp("activeField").getValue(),
                        registered       : Ext.getCmp("registeredField").getValue(),
                        srbd_id       : Ext.getCmp("srbd_idField").getValue(),
                        user          : window.JOSSO_USER,							
                        url            : Ext.getCmp("serverURLField").getValue()
                    }						
                    OpenLayers.Request.issue({
                        method: "POST",
                        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=wms",
                        async: true,        
                        data: JSON.stringify(jsondata),
                        params:{            
                            action  : "update"      
                        },
                        callback: function(request) 
                        {					
                            var result;
                            try {
                                result = JSON.parse(request.responseText);
                            } catch(e) {
                                
                            }
                            if (result && result.result== "OK" )
                            {								
                                record.data.server_name = Ext.getCmp("serverNameField").getValue();
                                record.data.url        = Ext.getCmp("serverURLField").getValue();
                                record.data.rest_url        = Ext.getCmp("serverRestURLField").getValue();
                                record.data.workspace        = Ext.getCmp("workspaceField").getValue();
                                wmsStore.reload();
                            } else {
                                servicesSetting.showMessage("Ошибка при обновлении WMS-сервиса", result && result.error || request.responseText);
                            }
                        }					
                    });
                }
            },
            addRecord : function()
            {
                var panel = Ext.getCmp("wmsPanelFields");

                if ((Ext.getCmp("serverNameField").getValue().length === 0) || (Ext.getCmp("serverURLField").getValue().length === 0))
                {
                    servicesSetting.errorFieldEmpty();
                }
              
                var jsondata = {
                    url            	: Ext.getCmp("serverURLField").getValue(),
                    rest_url            : Ext.getCmp("serverRestURLField").getValue(),
                    workspace           : Ext.getCmp("workspaceField").getValue(),
                    active              : Ext.getCmp("activeField").getValue(),
                    registered          : Ext.getCmp("registeredField").getValue(),
                    srbd_id             : Ext.getCmp("srbd_idField").getValue(),
                    user        	: window.JOSSO_USER,
                    server_name		: Ext.getCmp("serverNameField").getValue()
                }
                                    
                OpenLayers.Request.issue({
                    method: "POST",
                    url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=wms",
                    async: true,        
                    data: JSON.stringify(jsondata),
                    params:{            
                        action  : "insert"      
                    },
                    callback: function(request) 
                    {
                        var result;
                        try {
                            result = JSON.parse(request.responseText);
                        } catch(e) {
                                
                        }
                        if (result && result.result== "OK" )
                        {								
                            var record = {
                                server_name : Ext.getCmp("serverNameField").getValue(),
                                url        : Ext.getCmp("serverURLField").getValue(),
                                rest_url   : Ext.getCmp("serverRestURLField").getValue(),
                                workspace   : Ext.getCmp("workspaceField").getValue()
                            //                                owner      : servicesSetting.user 
                            }; 
                            wmsStore.reload();
                            Ext.getCmp("wmsGrid").getSelectionModel().select(Ext.getCmp("wmsGrid").store.data.length - 1);								
                            servicesSetting.newObject = false;
                        } else {
                            servicesSetting.showMessage("Ошибка при добавлении WMS-сервиса", result && result.error || request.responseText);
                        } 
                        
                    }				
                });
                
            },
            addRecord2Map : function()
            {
                if (!Ext.getCmp("wmsLayers").getSelectionModel().getSelection()[0])
                {
                    servicesSetting.notSelected ();
                }
                else {			
                    var key    = servicesSetting.wmsLayersStore.idCustom;
                    var source = app.layerSources[key];
				
                    var record = source.createLayerRecord ({
                        name   : Ext.getCmp('wmsLayers').getSelectionModel().getSelection()[0].data.name,
                        source : key
                    });
                    if (record)
                        app.mapPanel.layers.add([record]);
                }
            },
            items: [
            {
                flex: 1,
                border: false,
                layout: {
                    type:'hbox', 
                    align:'stretch'
                },
                items: [
                {
                    flex: 1,
                    layout: 'fit',
                    items: {
                        xtype  : 'grid',
                        id     : 'wmsGrid',
                        autoExpandColumn : "server_name", 
                        store : wmsStore,
                        border : false ,
                        ds     : wmsStore,
                        columns: [
                        {
                            id       : 'server_name',
                            header   : 'Наименование', 
                            flex 	 : 1,	
                            sortable : true,
                            dataIndex: 'server_name',
                            renderer : function(value,metaData,record,colIndex,store,view) {
                                metaData.attr  = 'ext:qtip="' + value + '"';
                                return value;
                            }
                        }
                        ],
                        listeners: {
                            select: function(sm, row, rec) {
                                servicesSetting.wmsPanel.rowSelect (rec);
                            },
                            viewready: function(grid) {
                                grid.getSelectionModel().select(0);
                                Ext.getCmp("saveButton").enable();
                            }
                        }					
                    }
                },
                {
                    xtype       : 'fieldset',
                    flex: 1,
                    labelAlign  : 'top',
                    anchor      : '100%',
                    bodyStyle   : 'padding: 10px 10px 5px 10px;',
                    id          : "wmsPanelFields",
                    style: {
                        "margin-left": "10px",
                        "margin-right": "0",
                        "background":"transparent",
                        "border":"none"
                    },
                    items: [{
                        xtype      : 'textfield',
                        fieldLabel : 'Наименование',
                        name       : 'server_name',
                        id		   : 'serverNameField',	
                        anchor     : "100%",
                        labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    },{
                        xtype      : 'textfield',
                        fieldLabel : 'URL',
                        name       : 'url',
                        id		   : 'serverURLField',
                        anchor     : "100%",
                        labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    },{
                        xtype      : 'textfield',
                        fieldLabel : 'REST URL',
                        name       : 'rest_url',
                        id		   : 'serverRestURLField',
                        anchor     : "100%",
                        labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    },{
                        xtype      : 'textfield',
                        fieldLabel : 'Рабочая область',
                        name       : 'workspace',
                        id		   : 'workspaceField',
                        anchor     : "100%",
                        labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    },									
                    {
                        xtype      : 'checkbox',
                        fieldLabel : 'Доступен',
                        name       : 'registered',
                        id         : 'registeredField',
                        anchor     : "100%",
                        checked    : true,
                        labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    },
                    {
                        xtype      : 'checkbox',
                        fieldLabel : 'Актуален',
                        name       : 'active',
                        id         : 'activeField',
                        anchor     : "100%",
                        checked    : true,
                        labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    },
                    {
                        xtype      : 'textfield',
                        fieldLabel : 'Идентификатор СРБД',
                        name       : 'srbd_id',
                        id         : 'srbd_idField',
                        anchor     : "100%",
                        labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    },
                    {
                        xtype      : 'textfield',
                        fieldLabel : 'Создатель',
                        name       : 'user_created_wms',
                        id       : 'user_created_wms',
                        disabled   : true,
                        anchor     : "100%",
                        labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    },
                    {
                        xtype      : 'textfield',
                        fieldLabel : 'Дата создания',
                        name       : 'date_created_wms',
                        id       : 'date_created_wms',
                        disabled   : true,
                        anchor     : "100%",
                        labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    },
                    {
                        id         : 'wmsLayersCount',
                        xtype      : 'label',  
                        html       : '&nbsp;',
                        style      : 'font-size:11px;font-weight: normal; font-style: italic;color:#8080ff'
                    },
                    {
                        xtype      : 'label',  
                        html       : '&nbsp;',
                        style      : 'font-size:20px;font-weight: bold'
                    }
                    ]
                },						
                ]
            },           
            {
                id        : 'wmsLayers',
                title     : 'Список слоев', 
                xtype     : 'grid',
                flex      : 1  ,
                style     : 'padding: 5px 5x 5px 5px',
                border    : true,
                height    : 206,
                autoExpandColumn: "title",
                ds        : this.wmsLayersStore,
                columns: [
                {
                    header    : 'Заголовок',
                    id        :	'wmsLayersHeader',
                    width     : 340, 
                    flex      : 1,
                    sortable  : true,
                    dataIndex : 'nodename',
                    renderer : function(value, metaData, record, colIndex, store, view) {
                        metaData.attr = 'ext:qtip="' + value + '"';
                        return value;
                    }
                },
                {
                    header    : 'Наименование', 
                    id		  :	'title',
                    width     : 340, 
                    flex      : 1,
                    sortable  : true,
                    dataIndex : 'layername'
                }
                ]
            }
            ]
        });
        //~~ WMS panel end ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        //~~ ArcGIS panel start ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        servicesSetting.arcgisPanel = this.arcgisPanel = new Ext.Panel({
            id: 'arcgisPanel',
            title: 'ArcGIS',
            border: false,
            layout: {
                type:'hbox',
                align:'stretch'
            },
            getSelectedRow : function (store, data)
            {
                var row = -1;
                if (store.getCount() > 0)
                {
                    for (var i = 0; i < store.getCount(); i++)
                    {
                        if ((store.data.items[i].data.title === data.title) &&
                            (store.data.items[i].data.url   === data.url))
                            {
                            row = i;
                            break;
                        };
                    };
                };
                return row;
            },
            clear : function()
            {
                Ext.getCmp("arcgisPanel").items.items[1].items.items[0].setValue('');
                Ext.getCmp("arcgisPanel").items.items[1].items.items[1].setValue('');
                Ext.getCmp("arcgisPanel").items.items[1].items.items[2].setValue('');
                Ext.getCmp("saveButton").enable();
                //Ext.getCmp("arcgisPanel").items.items[1].items.items[3].setValue(servicesSetting.user);
                //Ext.getCmp("arcgisPanel").items.items[1].items.items[4].setValue('public');
                //Ext.getCmp("arcgisAccessSelector").setDisabled (false);
				
                if ((Ext.getCmp("arcgisGrid").store.getCount() > 0) && Ext.getCmp("arcgisGrid").getSelectionModel().getSelection()[0])
                {
                    Ext.getCmp("arcgisGrid").getSelectionModel().deselectAll();
                //                    Ext.getCmp("arcgisGrid").getSelectionModel().deselectRow(this.getSelectedRow(Ext.getCmp("arcgisGrid").store, 
                //                        Ext.getCmp("arcgisGrid").getSelectionModel().getSelection()[0].data));
                }
            },
            rowSelect : function (i)
            {
                Ext.getCmp("arcgisPanel").items.items[1].items.items[0].setValue(arcgisStore.getAt(i).data.title );
                Ext.getCmp("arcgisPanel").items.items[1].items.items[1].setValue(arcgisStore.getAt(i).data.url   );
                Ext.getCmp("arcgisPanel").items.items[1].items.items[2].setValue(arcgisStore.getAt(i).data.format);
                Ext.getCmp("user_created_arcgis").setValue(arcgisStore.getAt(i).data.user_created);
                Ext.getCmp("date_created_arcgis").setValue(arcgisStore.getAt(i).data.date_created);
                //Ext.getCmp("arcgisPanel").items.items[1].items.items[3].setValue(arcgisStore.getAt(i).data.owner );
                //Ext.getCmp("arcgisPanel").items.items[1].items.items[4].setValue(arcgisStore.getAt(i).data.access);

                var disabled = false;
            //var disabled = true;
            //if (record.data.owner === servicesSetting.user) 
            //disabled = false;
            //                servicesSetting.lockControl ("arcgisAccessSelector", disabled);
            //                servicesSetting.newObject = false;
            },
            addRecord2Map : function()
            {
                var source = app.layerSources['arcgis93']; 
                if (!source)
                    source = new gxp.plugins.ArcGIS93Source();
                var url = Ext.getCmp("arcgisPanelURL").getValue();
                var layerStore = app.mapPanel.layers;
                var r = Ext.getCmp("arcgisGrid").getSelectionModel().getSelection()[0];
                var curl  = url + '?layers=show:' + r.get("id");
                var layer = source.createLayer(r.get("title"), curl);
                record = source.createRecord(r.get("id"), layer);
                if (record)
                    layerStore.add([record]);
				
							
            },
            addRecord : function()
            {

                if ((Ext.getCmp("arcgisPanelTitle").getValue().length === 0) || (Ext.getCmp("arcgisPanelURL").getValue().length === 0))
                {
                    servicesSetting.errorFieldEmpty();
                }
                else {
                    OpenLayers.Request.issue({
                        method: "POST",
                        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=arcgis",
                        async: true,        
                        data: JSON.stringify({
                            url     	: Ext.getCmp("arcgisPanelURL").getValue(),
                            title       : Ext.getCmp("arcgisPanelTitle").getValue(),
                            format      : Ext.getCmp("arcgisPanelFormat").getValue(),
                            user        : window.JOSSO_USER
                        }),
                        params:{            
                            action  : "insert"            
                        },
                        callback: function(request){
                            var result;
                            try {
                                result = JSON.parse(request.responseText);
                            } catch(e) {
                                
                            }
                            if (result && result.result== "OK" )

                            {								
                                var record = {
                                    title : Ext.getCmp("arcgisPanelTitle").getValue(),
                                    url   : Ext.getCmp("arcgisPanelURL").getValue(),
                                    format: Ext.getCmp("arcgisPanelFormat").getValue()
                                }; 
                                arcgisDS.add(record);
                                Ext.getCmp("arcgisGrid").getSelectionModel().select(Ext.getCmp("arcgisGrid").store.data.length - 1);
                                arcgisStore.reload();
                                Ext.getCmp('arcgisGrid').getView().refresh();
                                servicesSetting.newObject = false;
                            } else {
                                servicesSetting.showMessage("Ошибка при добавлении ArcGIS-сервиса", result && result.error || request.responseText);
                            } 
                        }					
                    });
                }
            },
            saveSelected : function()
            {
                var idx = this.getSelectedRow(Ext.getCmp("arcgisGrid").store, 
                    Ext.getCmp("arcgisGrid").getSelectionModel().getSelection()[0].data);
                var panel  = Ext.getCmp("arcgisPanel").items.items[1];                
                var record = Ext.getCmp("arcgisGrid" ).store.data.items[idx];

                if ((Ext.getCmp("serverNameField").getValue().length === 0) || (Ext.getCmp("serverURLField").getValue().length === 0))
                {
                    servicesSetting.errorFieldEmpty();
                }
                else if ((record.data.title  !== Ext.getCmp("arcgisPanelTitle").getValue()) ||
                    (record.data.url    !== Ext.getCmp("arcgisPanelURL").getValue()) ||
                    (record.data.format    !== Ext.getCmp("arcgisPanelFormat").getValue()))
                    {
                    OpenLayers.Request.issue({
                        method: "POST",
                        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=arcgis",
                        async: true,        
                        data: JSON.stringify({
                            id : record.data.id,
                            title : Ext.getCmp("arcgisPanelTitle").getValue(),
                            url	: Ext.getCmp("arcgisPanelURL").getValue(),
                            format: Ext.getCmp("arcgisPanelFormat").getValue(),
                            user : window.JOSSO_USER
                        }),
                        params:{            
                            action  : "update"            
                        },
                        callback: function(request) 
                        {
                            var result;
                            try {
                                result = JSON.parse(request.responseText);
                            } catch(e) {
                                
                            }
                            if (result && result.result== "OK" )
                            {								
                                arcgisStore.reload();
                                Ext.getCmp('arcgisGrid').getView().refresh();
                            } else {
                                servicesSetting.showMessage("Ошибка при обновлении ArcGIS-сервиса", result && result.error || request.responseText);
                            }
                        }					
                    });					
                }
            },
            removeSelected : function()
            {
                var idx = this.getSelectedRow(Ext.getCmp("arcgisGrid").store, 
                    Ext.getCmp("arcgisGrid").getSelectionModel().getSelection()[0].data);
                var record = Ext.getCmp("arcgisGrid").store.data.items[idx];

                Ext.MessageBox.show({
                    title: "Удаление сервиса ArcGIS",
                    msg: "Вы действительно хотите удалить выбранный сервис?",
                    buttonText: {
                        yes: "Да",
                        no:  "Нет"
                    },
                    fn: function (btn){
                        if(btn=='yes'){     
                            OpenLayers.Request.issue({
                                method: "GET",
                                url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=arcgis",
                                async: true,
                                params:{
                                    action  : "remove",
                                    id     : record.data.id
                                },
                                callback: function(request) 
                                {
                                    var result;
                                    try {
                                        result = JSON.parse(request.responseText);
                                    } catch(e) {
                                
                                    }
                                    if (result && result.result== "OK" )
                                    {								
                                        servicesSetting.arcgisPanel.clear();
                                        Ext.getCmp("arcgisGrid").store.remove (record);
                                    } else {
                                        servicesSetting.showMessage("Ошибка при уалении ArcGIS-сервиса", result && result.error || request.responseText);
                                    }
                                }					
                            });              
                        }
                    }
                });
    
    
            },
            items: [{
                flex: 1,
                layout: 'fit',
                items: {
                    xtype  : 'grid',
                    id     : 'arcgisGrid',
                    border : false ,
                    autoExpandColumn : 'title',
                    ds     : arcgisDS,
                    store: arcgisStore,
                    columns: [
                    {
                        id       : 'title',
                        header   : 'Наименование', 
                        flex 	 : 1,
                        sortable : true,
                        dataIndex: 'title'
                    }
                    ],
                    listeners: {
                        select: function(sm, row, rec) {
                            servicesSetting.arcgisPanel.rowSelect (rec);
                        },
                        viewready: function(grid) {
                            grid.getSelectionModel().select(0);
                            Ext.getCmp("saveButton").enable();
                        }
                    }					
                }
            },{
                flex: 1,
                xtype       : 'fieldset',
                columnWidth : 1.0,
                labelAlign  : 'top',
                anchor      : '100%',
                bodyStyle   : 'padding: 10px 10px 5px 10px;border-color: #f86c6c;',
                style: {
                    "margin-left": "10px",
                    "margin-right": "0",
                    "background": "transparent",
                    "border":"none"
                },
                items: [{
                    xtype      : 'textfield',
                    id		   : 'arcgisPanelTitle',
                    fieldLabel : 'Наименование',
                    name       : 'name',
                    anchor     : "100%",
                    labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                },{
                    xtype      : 'textfield',
                    id         : 'arcgisPanelURL',
                    fieldLabel : 'URL',
                    name       : 'url',
                    anchor     : "100%",
                    labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                },
                {
                    xtype      : 'combobox',
                    id         : 'arcgisPanelFormat',
                    store      : formats,
                    queryMode  : 'local',
                    displayField: 'display',
                    valueField : 'value',
                    fieldLabel : 'Формат',
                    name       : 'format',
                    anchor     : "100%",
                    labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                },
                {
                    xtype      : 'textfield',
                    fieldLabel : 'Создатель',
                    name       : 'user_created_arcgis',
                    id       : 'user_created_arcgis',
                    disabled   : true,
                    anchor     : "100%",
                    labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                },
                {
                    xtype      : 'textfield',
                    fieldLabel : 'Дата создания',
                    name       : 'date_created_arcgis',
                    id       : 'date_created_arcgis',
                    disabled   : true,
                    anchor     : "100%",
                    labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                }
                ]
            }]
        });
        //~~ ArcGIS panel end ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //~~ RSS panel start ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        servicesSetting.rssPanel = this.rssPanel = new Ext.Panel({
            id: 'rssPanel',
            title: 'GeoRSS',
            width: 750,
            border: false,
            layout: {
                type:'hbox',
                align:'stretch'
            },
            // Specifies that the items will now be arranged in columns
            getSelectedRow : function (store, data)
            {
                var row = -1;
                if (store.getCount() > 0)
                {
                    for (var i = 0; i < store.getCount(); i++)
                    {
                        if ((store.data.items[i].data.title === data.title) &&
                            (store.data.items[i].data.url   === data.url))
                            {
                            row = i;
                            break;
                        };
                    };
                };
                return row;
            },
            clear : function()
            {
                Ext.getCmp("rssPanel").items.items[1].items.items[0].setValue('');
                Ext.getCmp("rssPanel").items.items[1].items.items[1].setValue('');
                Ext.getCmp("rssPanel").items.items[1].items.items[2].setValue('');
                Ext.getCmp("saveButton").enable();
                //Ext.getCmp("rssPanel").items.items[1].items.items[4].setValue('public');
                //Ext.getCmp("rssPanel").items.items[1].items.items[3].setValue(servicesSetting.user);
                //Ext.getCmp("rssAccessSelector").setDisabled (false);

                if ((Ext.getCmp("rssGrid").store.getCount() > 0) && Ext.getCmp("rssGrid").getSelectionModel().getSelection()[0])
                {
                    Ext.getCmp("rssGrid").getSelectionModel().deselectAll();
                //                    Ext.getCmp("rssGrid").getSelectionModel().deselectRow(this.getSelectedRow(Ext.getCmp("rssGrid").store, 
                //                        Ext.getCmp("rssGrid").getSelectionModel().getSelection()[0].data));
                }
            },
            rowSelect : function (i)
            {
                Ext.getCmp("rssPanel").items.items[1].items.items[0].setValue(rssStore.getAt(i).data.title );
                Ext.getCmp("rssPanel").items.items[1].items.items[1].setValue(rssStore.getAt(i).data.url   );
                Ext.getCmp("rssPanel").items.items[1].items.items[2].setValue(rssStore.getAt(i).data.icon  );
                Ext.getCmp("user_created_rss").setValue(rssStore.getAt(i).data.user_created);
                Ext.getCmp("date_created_rss").setValue(rssStore.getAt(i).data.date_created);
                //Ext.getCmp("rssPanel").items.items[1].items.items[3].setValue(rssStore.getAt(i).data.owner );
                //Ext.getCmp("rssPanel").items.items[1].items.items[4].setValue(rssStore.getAt(i).data.access);
				
                var disabled = true;
                //if (record.data.owner === servicesSetting.user) 
                disabled = false;
            //                servicesSetting.lockControl ("rssAccessSelector", disabled);
            //                servicesSetting.newObject = false;
            },
            extractFileName : function (url)
            {
                var fname;
                var parts = url.split("/");
                if (parts)
                    fname = parts[parts.length-1];
                else
                    fname = 'Unreachable';
                if (fname.indexOf(".") > 0)
                    fname = fname.substring (0, fname.indexOf("."));
                return fname;
            },
            removeSelected : function()
            {
                var idx = this.getSelectedRow(Ext.getCmp("rssGrid").store, 
                    Ext.getCmp("rssGrid").getSelectionModel().getSelection()[0].data);
                this.clear();
                var record = Ext.getCmp("rssGrid").store.data.items[idx];

                Ext.MessageBox.show({
                    title: "Удаление RSS",
                    msg: "Вы действительно хотите удалить выбранный сервис?",
                    buttonText: {
                        yes: "Да",
                        no:  "Нет"
                    },
                    fn: function (btn){
                        if(btn=='yes'){     
                            OpenLayers.Request.issue({
                                method: "GET",
                                //url: CONFIG.OVROOT + "save",
                                url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=rss",
                                async: true,
                                params:{
                                    action  : "remove",
                                    id		: record.data.id
                                /*name    : this.extractFileName (record.data.url),
						title   : record.data.title                     ,
						icon    : record.data.icon                      ,
						url     : record.data.url                       //,
						//owner   : record.data.owner*/
                                },
                                callback: function(request) 
                                {
                                    var result;
                                    try {
                                        result = JSON.parse(request.responseText);
                                    } catch(e) {
                                
                                    }
                                    if (result && result.result== "OK" )
                                    {								
                                        Ext.getCmp("rssGrid").store.remove (record);
                                    } else {
                                        servicesSetting.showMessage("Ошибка при уалении RSS-сервиса", result && result.error || request.responseText);
                                    }
                                }					
                            });               
                        }
                    }
                });
                
                
            },
            saveSelected : function()
            {
                var idx = this.getSelectedRow(Ext.getCmp("rssGrid").store, 
                    Ext.getCmp("rssGrid").getSelectionModel().getSelection()[0].data);
                var panel  = Ext.getCmp("rssPanel").items.items[1];
                var record = Ext.getCmp("rssGrid" ).store.data.items[idx];
                var fname = this.extractFileName (Ext.getCmp("rssPanelURL").getValue());

                if ((Ext.getCmp("rssPanelTitle").getValue().length === 0) || (Ext.getCmp("rssPanelURL").getValue().length === 0))
                {
                    servicesSetting.errorFieldEmpty();
                }
                else if ((record.data.title  !== Ext.getCmp("rssPanelTitle").getValue()) ||
                    (record.data.url    !== Ext.getCmp("rssPanelURL").getValue()) ||
                    (record.data.icon   !== panel.items.items[2].getValue()) ||
                    (record.data.access !== panel.items.items[4].getValue()))
                    {
                    var doubled = false;
                    //                    if (rssStore.isRecordPresent (Ext.getCmp("rssPanelURL").getValue()))
                    //                        doubled = !(record.data.url === Ext.getCmp("rssPanelURL").getValue());
                    //                    if (doubled)
                    //                        servicesSetting.doubledRecord(servicesSetting.doubledRSS);
                    //                    else {
                    var jsondata = {							
                        id: record.data.id,
                        user: window.JOSSO_USER,
                        name: fname,
                        title : Ext.getCmp("rssPanelTitle").getValue(),
                        url   : Ext.getCmp("rssPanelURL").getValue(),
                        icon      : panel.items.items[2].getValue()
                    }
                        
                    OpenLayers.Request.issue({
                        method: "POST",
                        url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=rss",
                        async: true,        
                        data: JSON.stringify(jsondata),
                        params:{            
                            action  : "update"      
                        },
                        callback: function(request) 
                        {					
                            var result;
                            try {
                                result = JSON.parse(request.responseText);
                            } catch(e) {
                                
                            }
                            if (result && result.result== "OK" )
                            {								
                                record.data.name   = fname;
                                record.data.title  = Ext.getCmp("rssPanelTitle").getValue();
                                record.data.url    = Ext.getCmp("rssPanelURL").getValue();
                                record.data.icon   = panel.items.items[2].getValue();
                                //record.data.access = panel.items.items[4].getValue();
                                rssStore.reload();
                            } else {
                                servicesSetting.showMessage("Ошибка при обновлении RSS-сервиса", result && result.error || request.responseText);
                            }								                                                          
                        }					
                    });
						               
                }
            //                }
            },
            addRecord : function()
            {
                var panel = Ext.getCmp("rssPanel").items.items[1];

                if ((Ext.getCmp("serverNameField").getValue().length === 0) || (Ext.getCmp("rssPanelURL").getValue().length === 0))
                {
                    servicesSetting.errorFieldEmpty();
                }              
                var fname = this.extractFileName (Ext.getCmp("rssPanelURL").getValue());
                var jsondata = {
                    name      : fname                          ,
                    title     : Ext.getCmp("rssPanelTitle").getValue(),
                    url       : Ext.getCmp("rssPanelURL").getValue(),
                    icon      : panel.items.items[2].getValue(),
                    user      : window.JOSSO_USER
                }
                OpenLayers.Request.issue({
                    method: "POST",
                    url: CONFIG.PROXY + CONFIG.OVROOT + "services?service=rss",
                    async: true,        
                    data: JSON.stringify(jsondata),
                    params:{            
                        action  :"insert"            
                    },
                    callback: function(request) 
                    {
                        var result;
                        try {
                            result = JSON.parse(request.responseText);
                        } catch(e) {
                                
                        }
                        if (result && result.result== "OK" )
                        {								
                            var record = {
                                timer  : 5,
                                name   : fname,
                                title  : Ext.getCmp("rssPanelTitle").getValue(),
                                icon   : panel.items.items[2].getValue(),
                                url    : Ext.getCmp("rssPanelURL").getValue()//,
                            //owner  : servicesSetting.user           ,
                            //access : panel.items.items[4].getValue()
                            }; 
                            rssStore.add(record);
                            Ext.getCmp("rssGrid").getSelectionModel().select(Ext.getCmp("rssGrid").store.data.length - 1);
                            rssStore.reload();
                            servicesSetting.newObject = false;
                        } else {
                            servicesSetting.showMessage("Ошибка при добавлении RSS-сервиса", result && result.error || request.responseText);
                        }
                    }					
                });
            //                }
            },
            addRecord2Map : function()
            {              
					
                var source = app.layerSources['rss'];
                if (!source)
                    source = new gxp.plugins.RssSource();
                var layerStore = app.mapPanel.layers;
                var val = this.extractFileName (Ext.getCmp("rssPanelURL").getValue());
                var record = source.createRecord(val); 
                if (record)
                    layerStore.add([record]);				
            },
            items: [{
                flex: 1,
                //width : 560,
                //
                //                height: 485,
                layout: 'fit',
                items: {
                    xtype  : 'grid',
                    id     : 'rssGrid',
                    autoExpandColumn : 'title',
                    border : false,
                    store     : rssStore,
                    columns: [
                    {
                        id       : 'title',
                        header   : 'Наименование', 
                        flex: 1,
                        sortable : true,
                        dataIndex: 'title'
                    }
                    ],
                    listeners: {
                        select: function(sm, row, rec) {
                            servicesSetting.rssPanel.rowSelect (rec);
                        },
                        viewready: function(g) {
                            g.getSelectionModel().select(0);
                            Ext.getCmp("saveButton").enable();
                        } 
                    }
                }
            },{
                flex: 1,
                xtype       : 'fieldset',
                //                height      : 505,
                columnWidth : 1.0,
                labelAlign  : 'top',
                //				border      : false,
                anchor      : '100%',
                bodyStyle   : 'padding: 10px 10px 5px 10px;border-color: #f86c6c;',
                style: {
                    "margin-left": "10px",
                    "margin-right": "0",
                    "background": "transparent",
                    "border":"none"
                },
                items: [{
                    xtype      : 'textfield',
                    id		   : 'rssPanelTitle',
                    fieldLabel : 'Наименование',
                    name       : 'title',
                    anchor     : "100%",
                    labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                },{
                    xtype      : 'textfield',
                    id		   : 'rssPanelURL',
                    fieldLabel : 'URL',
                    name       : 'url',
                    anchor     : "100%",
                    labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                },
                this.iconSelector,
                {
                    xtype      : 'textfield',
                    fieldLabel : 'Создатель',
                    name       : 'user_created_rss',
                    id       : 'user_created_rss',
                    disabled   : true,
                    anchor     : "100%",
                    labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                },
                {
                    xtype      : 'textfield',
                    fieldLabel : 'Дата создания',
                    name       : 'date_created_rss',
                    id       : 'date_created_rss',
                    disabled   : true,
                    anchor     : "100%",
                    labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                }
                ]
            }]
        });
        //~~ RSS panel end ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		
        this.tabs = new Ext.tab.Panel({
            
            width: 1200,
            flex : 1,
            layoutOnTabChange : true,            
            items: [
            this.wmsPanel, 
            this.arcgisPanel, 
            this.rssPanel]
        /*,
            {
                title      : 'Анимация',
                id         : 'animationPanel',
                autoScroll : true,	
                layout: 'fit',					
                items	   : [ {
                    xtype: 'grid',
                    //width : 560,
                    height: 485,
                    id: 'animationGrid',
                    store: animationStore,
                    autoScroll: true,						
                    autoExpandColumn: "title",
                    //plugins: [expander],
                    colModel: new Ext.grid.ColumnModel([
                    //expander,
                    {
                        header: "Id", 
                        dataIndex: "anim_id", 
                        sortable: true
                    },

                    {
                        id: "title", 
                        flex: 1, 
                        header: "Наименование", 
                        dataIndex: "title", 
                        sortable: true
                    }							
                    ])						
                }],*//*
                addRecord2Map : function() {
                    var source = app.layerSources['animation'];
                    if (!source)
                        source = new gxp.plugins.AnimationSource();
                    var layerStore = app.mapPanel.layers;
                    var records = Ext.getCmp('animationGrid').getSelectionModel().getSelection()[0];
                    record = source.createRecord(records.get("title" ), records.get("name"), 
                        records.get("url"   ), records.get("x_axis"),
                        records.get("layers"));
                    if (record)
                        layerStore.add([record]);						
                }
            }							
            ],
            listeners: {
                'tabchange': function(tabPanel, tab){
                    if (tab.id === 'wmsPanel') {
                        servicesSetting.newObject = true;
                        servicesSetting.wmsPanel.clear();
                        servicesSetting.lockControl ("wmsAccessSelector", true);
                        servicesSetting.buttons[4].setDisabled (true);
                    } else if (tab.id === 'rssPanel') {
                        servicesSetting.rssPanel.clear();
                        servicesSetting.lockControl ("rssAccessSelector", true);
                        servicesSetting.buttons[4].setDisabled (true);
                    }
                }
            }
             */	
        });
        this.items = this.tabs;
		
        servicesSetting.user = app.currentUser;
			
        Ext.getCmp('wmsLayers').on('dblclick', function(evt)
        {
            servicesSetting.wmsPanel.addRecord2Map();
        });
	
        this.callParent(arguments);
    }    
});
