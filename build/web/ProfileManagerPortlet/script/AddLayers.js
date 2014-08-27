servicesSetting = {};

Ext.define('Ext.gispro.AddLayers', {
    extend: 'Ext.Window',
    title        : 'Выбор слоев',
    closeAction  : 'hide',
    layout       : 'fit',
    modal        : true,
    maximizable  : true,
    width        : 800,
    height       : 500,
    newObject    : false,
    user         : '',
    closeAction  : 'destroy',
    doubledRSS   : 'RSS с данным URL присутствует в списке',
    buttonAlign  : 'left',
    bbar: [    
    {
        text     : 'Добавить',
        id	 : 'addButton',
        handler  : function(){
            var resArr= [];
            if (this.up('.panel').tabs.activeTab.id === 'wmsPanel') {
                Ext.getCmp('wmsLayers').getSelectionModel().getSelection().forEach(function(r){
                    var f = r.data;
                    if (f) {
                        f.source = 'wms';
                        f.title = f.nodename;
                        f.url = Ext.getCmp('serverURLField').getValue();
                        f.layername = f.name;
                        f.visible = true;
                        f.opacity = 1;
                        resArr.push(f);
                    }
                });
            } else if (this.up('.panel').tabs.activeTab.id === 'customPanel') {
                Ext.getCmp('customLayers').getSelectionModel().getSelection().forEach(function(r){
                    var f = r.data;
                    if (f) {
                        f.source = 'wms';
                        f.title = f.nodename;
                        f.url = Ext.getCmp('customServerURLField').getValue();
                        f.layername = f.name;
                        f.visible = true;
                        resArr.push(f);
                    }
                });
            } else if (this.up('.panel').tabs.activeTab.id === 'arcgisPanel') {
                Ext.getCmp('arcgisGrid').getSelectionModel().getSelection().forEach(function(r){
                    var f = r.raw;
                    if (f) {
                        f.source = 'arcgis';
                        f.visible = true;
                        f.opacity = 1;
                        resArr.push(f);
                    }
                });
            } else if (this.up('.panel').tabs.activeTab.id === 'rssPanel'){
                Ext.getCmp('rssGrid').getSelectionModel().getSelection().forEach(function(r){
                    var f = r.raw;
                    if (f) {
                        f.source = 'rss';
                        f.visible = true;
                        f.style = f.icon;
                        f.opacity = 1;
                        resArr.push(f);
                    }
                });
            } else if (this.up('.panel').tabs.activeTab.id === 'animationPanel'){
                Ext.getCmp('animationGrid').getSelectionModel().getSelection().forEach(function(r){
                    var f = r.raw;
                    if (f) {
                        f.source = 'animation';
                        f.visible = true;
                        f.opacity = 1;
                        resArr.push(f);
                    }
                });
            }
            this.up('.window').callback.call(this,resArr)
        }
    },
    "->",
    {
        text     : 'Закрыть',
        handler  : function(){
            this.up(".window").close();
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
        //~~ custom layer store ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.customLayersStore = new Ext.data.Store({
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
                    Ext.getCmp('customLayersCount').getEl().update(' Количество слоев ' + this.data.length);
                },
                loadexception : function(o, arg, nul, e) {
                    console.log ('ServiceSetting.customLayersStore.loadexception : ' + e);
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
            Ext.Msg.alert('Транзакция', 'Ошибка при обработке записи на сервере');
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
                Ext.getCmp("user_created_wms").setValue(wmsStore.getAt(i).data.user_created);
                Ext.getCmp("date_created_wms").setValue(wmsStore.getAt(i).data.date_created);
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
                            handleCapabilities(source.raw.url,capsStore,function(){
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
                        border : false ,
                        store     : wmsStore,
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
                //height    : 206,
                autoExpandColumn: "title",
                multiSelect : true,
                store        : this.wmsLayersStore,
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
            
            items: [{
                flex: 1,
                layout: 'fit',
                items: {
                    xtype  : 'grid',
                    id     : 'arcgisGrid',
                    multiSelect : true,
                    border : false ,
                    autoExpandColumn : 'title',
                    store: arcgisStore,
                    columns: [
                    {
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
                    "background": "white",
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
            items: [{
                flex: 1,
                //width : 560,
                //
                //                height: 485,
                layout: 'fit',
                items: {
                    xtype  : 'grid',
                    id     : 'rssGrid',
                    multiSelect : true,
                    autoExpandColumn : 'title',
                    border : false,
                    store     : rssStore,
                    columns: [
                    {
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
                    "background": "white",
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
		
        this.customPanel = new Ext.Panel({
            id: 'customPanel',
            title: 'Вручную',
            heigth: 750,
            layout: {
                type: 'vbox', 
                align:'stretch'
            },
            clear : function()
            {
                Ext.getCmp("serverNameField").setValue('');
                Ext.getCmp("serverURLField").setValue('');
                Ext.getCmp("serverRestURLField").setValue('');
                //Ext.getCmp("customPanel").items.items[1].items.items[2].setValue(servicesSetting.user);
                //Ext.getCmp("customPanel").items.items[1].items.items[3].setValue('public');
                //Ext.getCmp("customAccessSelector").setDisabled (false);
				
                if ((Ext.getCmp("customGrid").store.getCount() > 0) && Ext.getCmp("customGrid").getSelectionModel().getSelected())
                {
                    Ext.getCmp("customGrid").getSelectionModel().deselectRow(this.getSelectedRow(Ext.getCmp("customGrid").store, 
                        Ext.getCmp("customGrid").getSelectionModel().getSelected().data));
                }
                this.clearGridLayers();
            },
            getLayerSources : function ()
            {
                var id;
                for (var rec in app.layerSources)
                {
                    if (app.layerSources[rec].baseParams && (app.layerSources[rec].baseParams.SERVICE === 'custom') &&
                        (app.layerSources[rec].baseParams.REQUEST === 'GetCapabilities') &&
                        (app.layerSources[rec].ptype === 'gxp_customcsource') &&
                        (app.layerSources[rec].title === Ext.getCmp("customServerNameField").getValue()) &&
                        (app.layerSources[rec].url   === Ext.getCmp("customServerURLField").getValue()) &&
                        (app.layerSources[rec].rest_url   === Ext.getCmp("customServerRestURLField").getValue()))
                        {
                        id = rec;
                        break;
                    }
                }
                return id;
            },
            showLayerSources : function (id)
            {
                servicesSetting.customLayersStore.idCustom = id;

                servicesSetting.customLayersStore.data = app.layerSources[id].store.data;
                Ext.getCmp("customLayers"     ).getView().refresh();
                Ext.getCmp('customLayersCount').getEl().update('Количество слоев ' + servicesSetting.customLayersStore.data.length);
            },
            clearGridLayers : function ()
            {
                Ext.getCmp('customLayersCount').getEl().update('&nbsp;');
                if (Ext.getCmp("customLayers").getSelectionModel().getSelected())
                {
                    Ext.getCmp("customLayers").getSelectionModel().deselectRow(this.getSelectedRow(Ext.getCmp("customLayers").store, 
                        Ext.getCmp("customLayers").getSelectionModel().getSelected().data));
                }
                servicesSetting.customLayersStore.proxy = new Ext.data.HttpProxy({
                    url: ''
                });
                servicesSetting.customLayersStore.data = [];
                Ext.getCmp("customLayers").getView().refresh();
            },			
            addRecord2Map : function()
            {
                if (!Ext.getCmp("customLayers").getSelectionModel().getSelected())
                {
                    servicesSetting.notSelected ();
                }
                else {			
                    var key    = servicesSetting.customLayersStore.idCustom;
                    var source = app.layerSources[key];
				
                    var record = source.createLayerRecord ({
                        name   : Ext.getCmp('customLayers').getSelectionModel().getSelected().data.name,
                        title : isAlreadyInUse(Ext.getCmp('customLayers').getSelectionModel().getSelected().data.title),
                        source : key
                    });
                    if (record)
                        app.mapPanel.layers.add([record]);
                }
            },
            items: [
            {
                width: 750,
                border: false,
                layout: {
                    type:'column', 
                    align:'stretch'
                },
                bodyStyle   : 'background-color: #efefef',
                items: [
                {
                    xtype       : 'fieldset',
                    //height      : 280,
                    columnWidth : 1.0,
                    labelAlign  : 'top',
                    anchor      : '100%',
                    bodyStyle   : 'padding: 10px 10px 5px 10px; background-color: #efefef',
                    id			: "customPanelFields",
                    style: {
                        "margin-left": "10px",
                        "margin-right": "0"
                    },
                    items: [{
                        xtype      : 'textfield',
                        fieldLabel : 'Наименование',
                        name       : 'customServer_name',
                        id		   : 'customServerNameField',	
                        anchor     : "100%",
                        labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    },{
                        xtype      : 'textfield',
                        fieldLabel : 'URL',
                        name       : 'customUrl',
                        id		   : 'customServerURLField',
                        anchor     : "100%",
                        labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    },{
                        xtype      : 'textfield',
                        fieldLabel : 'REST URL',
                        name       : 'custom_rest_url',
                        id		   : 'customServerRestURLField',
                        anchor     : "100%",
                        labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    },									
                    //{
                    //xtype      : 'textfield',
                    //fieldLabel : 'Владелец',
                    //name       : 'owner',
                    //disabled   : true,
                    //anchor     : "100%",
                    //labelStyle : 'font-size:12px;font-weight: normal; color:#909090'
                    //},	//this.customAccessSelector,
                    {
                        id         : 'customLayersCount',
                        xtype      : 'label',  
                        html       : '&nbsp;',
                        style      : 'font-size:11px;font-weight: normal; font-style: italic;color:#8080ff'
                    },
                    {
                        xtype      : 'label',  
                        html       : '&nbsp;',
                        style      : 'font-size:20px;font-weight: bold'
                    },
                    {
                        xtype      : 'button',  
                        width      :  100,
                        text       : 'Подключить',
                        style      : 'font-size:14px;font-weight: bold;color:#ffff00',
                        handler  : function(){
                            // check 
                            if (Ext.getCmp("customServerURLField").getValue()) {
                                Ext.getCmp("customLayers").setLoading(true);
                                var capsStore = new GeoExt.data.WmsCapabilitiesStore({
                                    url: CONFIG.PROXY_REMOTE + Ext.getCmp("customServerURLField").getValue() + "/wms?service=wms&version=1.3.0&request=getcapabilities",
                                    autoLoad : true,
                                    listeners: {
                                        load : function(store,records,status) {                   
                                            handleCapabilities(Ext.getCmp("customServerURLField").getValue(),capsStore,function() {
                                                Ext.getCmp("customLayers").setLoading(false);
                                            
                                                if (records.length!=0) {
                                                    records.forEach(function(record){
                                                        record.set('layername', record.get('name'));
                                                        record.set('nodename', record.get('title'));
                                                    });
                                                }
                                                Ext.getCmp("customLayers").getStore().loadData(capsStore.getRange());
                                                Ext.getCmp("customLayers").getView().focusRow(0);           
                                            });
                                        }
                                    }
                                });		
												
                            }	
                        }
                    }
                    ]
                },						
                ]
            },
            {
                xtype     : 'label',  
                colspan   : 2,
                text      : 'Список слоев',
                style     : 'padding: 5px 5px 5px 3px;font-size:12px;font-weight: bold;color:#909090'
            },
            {
                id        : 'customLayers',
                xtype     : 'grid',
                colspan   : 2,
                multiSelect : true,
                style     : 'padding: 5px 5x 5px 5px',
                border    : true,
                height    : 206,
                autoExpandColumn: "title",
                //width     : "100%",				
                //autoWidth : true,
                store        : this.customLayersStore,
                columns: [
                {
                    header    : 'Заголовок',
                    id		  :	'customheader',
                    width     : 340, 
                    sortable  : true,
                    dataIndex : 'title',
                    renderer : function(value, metaData, record, colIndex, store, view) {
                        metaData.attr = 'ext:qtip="' + value + '"';
                        return value;
                    }
                },
                {
                    header    : 'Наименование', 
                    id		  :	'title',
                    width     : 340, 
                    sortable  : true,
                    dataIndex : 'name'
                }
                ]
            }
            ]
        });
		
		
        this.tabs = new Ext.tab.Panel({           
            items: [
            this.wmsPanel, 
            this.arcgisPanel, 
            this.rssPanel,
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
                    multiSelect : true,
                    store: animationStore,
                    autoScroll: true,						
                    autoExpandColumn: "title",
                    //plugins: [expander],
                    columns: [
                    //expander,
                    {
                        header: "Id", 
                        dataIndex: "anim_id", 
                        sortable: true
                    },

                    {
                        id: "anim_title", 
                        flex: 1, 
                        header: "Наименование", 
                        dataIndex: "title", 
                        sortable: true
                    }							
                    ]				
                }]
            },
            this.customPanel
            ]	
        });
        this.items = this.tabs;
		
        
        this.callParent(arguments);
    }
});
