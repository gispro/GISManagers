Ext.require([
    'Ext.data.writer.Json',
    'GeoExt.data.reader.WmsCapabilities',
    'GeoExt.data.WmsCapabilitiesLayerStore'
    ]);

var viewerTools = [
{
    leaf: true, 
    text: "Информация", 
    checked: false, 
    iconCls: "information",
    ptype: "gxp_gridwmsgetfeatureinfo"
}, {
    leaf: true, 
    text: "Выборка", 
    checked: false, 
    iconCls: "queryform",
    ptype: "gxp_queryform"
}, {
    leaf: true, 
    text: "Навигация", 
    checked: false, 
    iconCls: "pan",
    ptype: "gxp_navigation"
},  {
    leaf: true, 
    text: "Измерения" ,
    checked: false, 
    iconCls: "ruler",
    ptype: "gxp_measure"
},{
    leaf: true, 
    text: "Легенда", 
    checked: false, 
    iconCls: "legend",
    ptype: "gxp_legend"
},{
    leaf: true, 
    text: "Приблизить" + " / " + "Отдалить", 
    checked: false, 
    iconCls: "magnifier",
    ptype: "gxp_zoom"
}, {
    leaf: true, 
    text: "Предыдущая видимая область" + " / " + "Следующая видимая область", 
    checked: false, 
    iconCls: "zoom-previous",
    ptype: "gxp_navigationhistory"
}, {
    leaf: true, 
    text: "Показать всю карту", 
    checked: false, 
    iconCls: "arrow-out",
    ptype: "gxp_zoomtoextent"
},{
    leaf: true,
    text: "Графики",
    ptype: "gxp_prickertool",
    iconCls: "pricker",
    checked: false
},{
    leaf: true,
    text: "Маркеры",
    //    ptype: "gxp_featuremanager",
    ptype: "gxp_featureeditorpanel",    
    iconCls: "featuremanager",
    checked: false
},{
    leaf: true,
    text: "Журнал",
    ptype: "gxp_logger",
    iconCls: "logger",
    checked: false
},{
    leaf: true,
    text: "Печать",
    ptype: "gxp_print",
    iconCls: "printer",
    checked: false
}
]

var projections = Ext.create('Ext.data.Store', {
    fields: ['display', 'value', 'type'],
    data : [
    {
        "display":"Меркатора", 
        "value":"EPSG:3857",
        "type":"common"
    },
    {
        "display":"Географическая", 
        "value":"EPSG:4326",
        "type":"special"
    },
    {
        "display":"Коническая", 
        "value":"EPSG:102012",
        "type":"special"
    },    
    {
        "display":"Полярная север", 
        "value":"EPSG:3576",
        "type":"special"
    },
    {
        "display":"Полярная юг", 
        "value":"EPSG:3976",
        "type":"special"
    }

    ]
});


var basemaps = Ext.create('Ext.data.Store', {
    fields: ['name', 'title'],
    data: [    
    {
        title: "Без картоосновы",
        name: "empty",
        type : "supportNonMercator"
    },
    {
        title: "ЭКО 3.1",
        name: "eko_merge",
        type : "supportNonMercator"
    },
    {
        title: "ЭКО 3.1 бланк",
        name: "eko_blank",
        type : "supportNonMercator"
    },
    {
        title: "Bing карта",
        name: "Road",
        type : "usual"
    },
    {
        title: "Bing спутник",
        name: "Aerial",
        type : "usual"
    },
    {
        title: "Bing гибрид",
        name: "AerialWithLabels",
        type : "usual"
    },
    {
        title: "OpenStreetMap"  ,
        name: "mapnik",
        type : "usual"
    }
    ]
});

                    
                          
                          

var layers = Ext.create('Ext.data.Store', {
    fields: ['layerName', 'record'],
    listeners : {
        add : function() {
            Ext.getCmp('profilePanel').layersLeft--;
            if (Ext.getCmp('profilePanel').layersLeft>=0) Ext.getCmp('layersGrid').setTitle("Слои: " + (Ext.getCmp('profilePanel').layersTotal - Ext.getCmp('profilePanel').layersLeft) + "/" + Ext.getCmp('profilePanel').layersTotal);
            if (Ext.getCmp('profilePanel').layersLeft==0) {
                Ext.getCmp('profilePanel')._setLoading(false);   
                Ext.getCmp('layersGrid').setLoading(false);   
                Ext.getCmp('layersGrid').setViewDisabled(false);
            };
        }
    }
});


Ext.define('Ext.gispro.ProfilePanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'profilePanel', 
    tbar: {
        xtype: 'buttongroup',
        items:[
        {
            xtype: 'button',
            text : "Новый",
            //iconCls: 'add-btn',
            listeners: {
                click: function(n) {
                    resetFields();
                    Ext.getCmp('layersGrid').setTitle("Слои");
                    Ext.getCmp('dateField').setValue(new Date().toLocaleString());
                    Ext.getCmp('ownerField').setValue(app.currentUser);
                    Ext.getCmp('layersGrid').gotLayers =[];
                    Ext.getCmp('layersGrid').setViewDisabled(false);
                }
            }
        },
        {
            xtype: 'button',
            text : "Сохранить",
            id: 'saveProfileBtn',
            listeners: {
                click: function(n) {
                    saveProfile();
                }
            }
        },
        {
            xtype: 'button',
            text : "Удалить",
            //iconCls: 'add-btn',
            listeners: {
                click: function(n) {
                    askForDelete (this.up('.panel').up('.panel').items.items[0].getSelectionModel().getSelection()[0].get('profileId'));
                }
            }
        },
        {
            xtype: 'tbspacer'
        },
        {
            xtype: 'button',
            text : "Запустить",
            //iconCls: 'add-btn',
            listeners: {
                click: function() {
                    if (this.up('.panel').up('.panel').items.items[0].getSelectionModel().getSelection()[0])
                        setCurrentProfileId(this.up('.panel').up('.panel').items.items[0].getSelectionModel().getSelection()[0].get('profileId'));
                }	
            }
        },
        {
            xtype: 'button',
            text : "Сохранить в CSV",
            //iconCls: 'add-btn',
            listeners: {
                click: function(n) {
                    exportCSV();
                }
            }        
        }
        
        ]
    },  
    _setLoading: function(b) {
        if (!b) {
        //  Ext.getCmp('layersGrid').setTitle("Слои");
        }
        this.setLoading(b);
        Ext.getCmp('layersGrid').setDisabled(b);
    },
    layout: {
        type:'border', 
        align:'stretch'        
    },
    defaults: {
        split: true
    },
    items: [
    {        
        flex: 1,
        region:'west',
        xtype: 'grid',
        store: profileStore,
        autoScroll: true,
        columns:[
        {
            header: "Наименование", 
            dataIndex: "profileName", 
            flex: 5,
            sortable: true
        },
        {
            header: "Ид. профиля", 
            flex: 5,
            dataIndex: "profileId", 
            sortable: true
        },
        {
            header: "Создатель", 
            hidden: true,
            flex: 5,
            dataIndex: "profileOwner", 
            sortable: true
        },
        {
            header: "Дата создания", 
            flex: 3,
            dataIndex: "dateCreate", 
            sortable: true,
            doSort: function(state) {
                    var ds = this.up('grid').getStore();
                    var field = this.getSortParam();
                    ds.sort({
                            property: field,
                            direction: state,
                            sorterFn: function(v1, v2) {
                                    return  (new Date(v1.raw[field]) > new Date(v2.raw[field]) ? 1 : new Date(v1.raw[field]) < new Date(v2.raw[field]) ? -1 : 0);
                            }
                    });
            }
        },
        ],
        listeners : {
            select: function(sm, row, rec) {
                try {
                    
                
                    Ext.getCmp('profilePanel')._setLoading(true);
                    profileStore.getAt(rec).raw.profileOwner=="commonprofile" ? undefined : Ext.getCmp('ownerField').setValue(profileStore.getAt(rec).raw.profileOwner);
                    Ext.getCmp('dateField').setValue(new Date(profileStore.getAt(rec).raw.dateCreate).toLocaleString());
                    OpenLayers.Request.issue({
                        method: "GET",
                        url: CONFIG.PROXY_REMOTE + CONFIG.REST_URL + "/get/"+profileStore.getAt(rec).raw.profileId+".json",
                        async: true,                    
                        callback: function(request) 
                        {
                            try {
                                resetFields();
                                if (request.responseText=="") return;
                                var p = JSON.parse(request.responseText);

                                if (p.properties && p.properties.entry && p.properties.entry.filter) {
                            
                                    var arrtools = p.properties.entry.filter(function(el){
                                        return el.key=="tools"
                                    });
                                    if (arrtools && arrtools.length>0) {
                                        var tools = JSON.parse(arrtools[0].value);
                                        var needCheck = function(ptype) {
                                            return tools.filter(function(el){
                                                return el==ptype;
                                            }).length>0
                                        }
                                        Ext.getCmp('toolsTree').getRootNode().childNodes.every(function(el){
                                            if (needCheck(el.raw.ptype))
                                                el.set('checked',true);
                                            return true;
                                        });
                            
                                    }
                        
                                    var arrlayers = p.properties.entry.filter(function(el){
                                        return el.key=="layers"
                                    });
                                    if (arrlayers[0]){                                    
                                        Ext.getCmp('profilePanel').layersLeft = JSON.parse(arrlayers[0].value).length;
                                        Ext.getCmp('profilePanel').layersTotal = JSON.parse(arrlayers[0].value).length;
                                        if (JSON.parse(arrlayers[0].value).length>0) 
                                            Ext.getCmp('layersGrid').setTitle("Слои: " + (Ext.getCmp('profilePanel').layersTotal - Ext.getCmp('profilePanel').layersLeft) + "/" + Ext.getCmp('profilePanel').layersTotal);
                                        else 
                                            Ext.getCmp('layersGrid').setTitle("Слои");
                                        if (Ext.getCmp('profilePanel').layersLeft==0) Ext.getCmp('profilePanel')._setLoading(false);                                        
                                    }
                                    if (arrlayers && arrlayers.length>0 && JSON.parse(arrlayers[0].value).length>0) {
                                        Ext.getCmp('layersGrid').setViewDisabled(true);
                                        Ext.getCmp('layersGrid').gotLayers = JSON.parse(arrlayers[0].value);                                                                                
                                    } else {
                                        Ext.getCmp('layersGrid').gotLayers = [];
                                        Ext.getCmp('layersGrid').setViewDisabled(false);
                                    }
                            
                            
                                    var prj = p.properties.entry.filter(function(el){
                                        return el.key=="projection"
                                    });
                                    if (prj.length  > 0) {
                                        Ext.getCmp('projectionField').setValue(prj[0].value);
                                    } else {
                                        Ext.getCmp('projectionField').clearValue();
                                    }
                           
                                    var basemap = p.properties.entry.filter(function(el){
                                        return el.key=="basemap"
                                    });
                                    if (prj.length  > 0) {
                                        Ext.getCmp('basemapField').setValue(basemap[0].value);
                                        Ext.getCmp('projectionField').enable();
                                    } else {
                                        Ext.getCmp('basemapField').clearValue();
                                    }
                            
                                    var extent = p.properties.entry.filter(function(el){
                                        return el.key=="extent"
                                    });
                                    if (extent.length  > 0) {
                                        Ext.getCmp('extentField').setValue(extent[0].value);
                                    } else {
                                        Ext.getCmp('extentField').setValue("");
                                    }
                            
                            
                                } else {
                                    Ext.getCmp('projectionField').clearValue();
                                    Ext.getCmp('extentField').reset();
                                }
                                Ext.getCmp('profileNameField').setValue(p.description.profileName);
                                Ext.getCmp('profileNameEnField').setValue(p.description.profileNameEn);
                                Ext.getCmp('editedProfileId').setValue(p.description.profileId);
                        
                                Ext.getCmp('profilePanel')._setLoading(false);
                            }
                            catch(e){
                                Ext.Msg.alert('Ошибка','Произошла ошибка при чтении профиля. Возможно профиль был поврежден');
                                Ext.getCmp('profilePanel')._setLoading(false);
                            }
                        }
                    });
                }
                
                catch (e) {
                    Ext.Msg.alert('Ошибка','Произошла ошибка при чтении профиля. Возможно профиль был поврежден');
                    Ext.getCmp('profilePanel')._setLoading(false);
                }
            }
        }
    },
    {
        xtype: 'panel',
        region:'center',
        //layout: 'fit',
        autoScroll: true,
        flex: 1,
        items: [
        {
            xtype       : 'fieldset',
            flex: 1,
            labelAlign  : 'top',
            anchor      : '100%',
            border      : 0,
            bodyStyle   : 'padding: 10px 10px 5px 10px;',
            id		: "profileFields",
            style: {
                "margin-left": "10px",
                "margin-right": "0",
                "background": "transparent"
            },
            items: [{
                xtype      : 'textfield',
                id	   : 'editedProfileId',	
                fieldLabel : 'Ид.профиля',
                disabled   : true, 
                name       : 'editedProfileId',
                anchor     : "100%"
            },{
                xtype      : 'textfield',
                fieldLabel : 'Наименование',
                name       : 'profileName',
                id	   : 'profileNameField',	
                anchor     : "100%"
            },{
                xtype      : 'textfield',
                fieldLabel : 'Англ. наименование',
                name       : 'profileNameEn',
                id	   : 'profileNameEnField',	
                anchor     : "100%"
            },{
                xtype      : 'textfield',
                fieldLabel : 'Владелец',
                name       : 'owner',
                //                value      : app.currentUser, 
                disabled   : true,
                id	   : 'ownerField',	
                anchor     : "100%",
                hidden     : true
            },{
                xtype      : 'textfield',
                fieldLabel : 'Дата создания',
                name       : 'date',
                //value      : new Date().toLocaleString(),
                disabled   : true, 
                id	   : 'dateField',	
                anchor     : "100%"
            },{
                xtype      : 'textfield',
                fieldLabel : 'Охват карты',
                name       : 'extent',
                id         : 'extentField',
                readOnly   : true,
                anchor     : "100%"
            },{
                xtype: 'button',
                text: "Вычислить",
                id: 'extentBtn',
                handler: function() {
                    var p = Ext.create('Ext.gispro.ExtentPicker', {
                        projection: Ext.getCmp('projectionField').getValue() || "EPSG:3857",
                        callback : function (value) {
                            Ext.getCmp('extentField').setValue(value);
                        }
                    });
                    p.show();
                } 
            },{
                xtype      : 'combobox',
                store      : basemaps,
                queryMode  : 'local',
                displayField: 'title',
                valueField : 'name',
                fieldLabel : 'Картооснова',
                name       : 'basemap',
                id         : 'basemapField',
                anchor     : "100%",
                listeners: {
                    select: function(combo, records, eOpts) {
                        Ext.getCmp('projectionField').setDisabled(false);
                        projections.reload();
                        if (records[0].raw.type!="supportNonMercator"){
                            rec=projections.getRange()[0];
                            projections.removeAll();
                            projections.add(rec);
                        }
                    }
                }
            },{
                xtype      : 'combobox',
                store      : projections,
                queryMode  : 'local',
                disabled   : true,
                displayField: 'display',
                valueField : 'value',
                fieldLabel : 'Проекция',
                name       : 'projection',
                id         : 'projectionField',
                anchor     : "100%"
            },{
                xtype      : 'checkbox',
                fieldLabel : 'Профиль общего пользования',
                checked    : false, 
                id	   : 'commonProfile',	
                anchor     : "100%",
                hidden     : true
            },{
                xtype      : 'grid',
                title      : 'Слои',
                store      : layers,
                name       : 'layers',
                height     : 250, 
                id         : 'layersGrid',
                anchor     : "100%",
                columns    : [
                {
                    header: 'Видимость',
                    dataIndex:'record',
                    renderer: function(record,b,c) {
                        return "<input onclick='Ext.getCmp(\"layersGrid\").getView().getRecord("+b.recordIndex+").get(\"record\").visible=document.getElementById(\"layerCheckbox"+c.internalId+"\").checked' type='checkbox' id ='layerCheckbox"+c.internalId+"' " + (typeof(record.visible)=="undefined" ? "checked='checked'" :  record.visible ? "checked='checked'" : "") + "/>";
                    }
                },
                {
                    header: "Наименование", 
                    dataIndex: "layerName", 
                    flex: 1,
                    sortable: true
                },
                {
                    // this action column allow to include chosen layer to chart
                    header: "Свойства",
                    xtype:'actioncolumn',
                    flex: 1,
                    items: [{
                        iconCls: "gxp-icon-edit",	//	new class in all.css                        
                        handler: function(grid, rowIndex, colIndex) {
                            var rec = grid.getStore().getAt(rowIndex);                            
                            new Ext.Window({
                                title:'Свойства слоя: ' + (rec.get('record').title || ""),
                                width: 300,
                                height: 200,
                                resizable : false,
                                bbar : [
                                "->",
                                {
                                    text: "Готово",
                                    handler: function(){                                        
                                        var record = rec.get("record");
                                        var fields = this.up('.panel').items.getRange()[0].items.getRange();
                                        //                                    record.visible=fields[0].getValue();
                                        record.opacity=fields[0].getValue()/100;
                                        record.stylename = fields[1].getValue();
                                        
                                        this.up('.window').close();
                                    }
                                }
                                ],
                                items: [
                                {
                                    xtype       : 'fieldset',
                                    flex: 1,
                                    labelAlign  : 'top',
                                    anchor      : '100%',
                                    border      : 0,
                                    bodyStyle   : 'padding: 10px 10px 5px 10px;background-color:white',
                                    style: {
                                        "margin-left": "10px",
                                        "margin-right": "0",
                                        "background": "transparent"
                                    },
                                    items: [
                                    {
                                        xtype      : 'slider',
                                        fieldLabel : 'Прозрачность',
                                        minValue   : 0,
                                        width      : 100,
                                        maxValue   : 100,
                                        name       : 'layerOpacity',
                                        value      : rec.get("record").opacity*100, 
                                        anchor     : "100%"
                                    },
                                    {
                                        xtype      : 'combobox',
                                        fieldLabel : 'Стиль слоя',
                                        name       : 'layerStyle',
                                        anchor     : "100%",
                                        displayField: 'name',
                                        valueField : 'name',
                                        store      : defaultStyleStore,             
                                        queryMode  : 'local',
                                        value      : rec.get("record").stylename, 
                                        hidden     : rec.get("record").source != "wms", 
                                        doQuery: function (e,b,d){
                                            var c=this,a=c.beforeQuery({
                                                query:e||"",
                                                rawQuery:d,
                                                forceAll:b,
                                                combo:c,
                                                cancel:false
                                            });
                                            if(a===false||a.cancel){
                                                return false
                                            }
                                            if(c.queryCaching&&a.query===c.lastQuery){
                                                c.expand()
                                            }else{
                                                c.lastQuery=a.query;
                                                c.doLocalQuery(a)
                                            }
                                            return true
                                        },
                                        anyMatch: true,
                                        caseSensitive: false
                                    }]
                                }]
                            }).show();
                        }
                    }]
                }
                ],
                tbar: [
                {
                    xtype: "button",
                    id: 'addLayersBtn',
                    text: "Добавить",
                    //iconCls: 'add-btn',
                    handler: function(){
                        var p = Ext.create('Ext.gispro.AddLayers', {
                            callback : function (recs) {
                                recs.forEach(function(rec){
                                    layers.add({
                                        layerName : rec.title, 
                                        record : rec
                                    });
                                })
                            }
                        });
                        p.show();
                    }
                },{
                    text: "Удалить",
                    id: 'removeLayersBtn',
                    handler: function(){
                        var sel = Ext.getCmp('layersGrid').getSelectionModel().getSelection()
                        if (sel.length)
                            Ext.MessageBox.show({
                                title: "Редактирование слоев",
                                msg: "Вы действительно хотите исключить выбранный слой?",
                                buttonText: {
                                    yes: "Да",
                                    no:  "Нет"
                                },
                                fn: function (btn){
                                    if(btn=='yes'){     
                                        Ext.getCmp('layersGrid').getStore().remove(sel);
                                    }
                                }
                            });
                    }
                },{
                    text: "Загрузить",
                    id: 'loadLayersBtn',
                    disabled: true,
                    handler: function(){
                        Ext.getCmp('layersGrid').loadLayers();
                        this.disable();
                    }
                }
                ],
                setViewDisabled: function(b){
                    Ext.getCmp('loadLayersBtn').setDisabled(!b);
                    Ext.getCmp('addLayersBtn').setDisabled(b);
                    Ext.getCmp('removeLayersBtn').setDisabled(b);
                    Ext.getCmp('saveProfileBtn').setDisabled(b);                    
                    if (!b) Ext.getCmp('layersGrid').setTitle("Слои");
                    this.getView().setDisabled(b);
                },
                loadLayers : function () {
                    try {
                        this.setLoading(true);
                        if (this.gotLayers && this.gotLayers.length>0) {
                            this.gotLayers.forEach(function(el,idx){
                                var layer= {}
                                if (el.source=="wms") {                                                
                                    window.setTimeout(function(){
                                        var capsStore = new GeoExt.data.WmsCapabilitiesStore({
                                            url: CONFIG.PROXY_REMOTE + el.url + "?service=wms&version=1.3.0&request=getcapabilities",
                                            id : 'capabilitiesStore'+(new Date().getTime()),
                                            autoLoad : true,
                                            single:true,
                                            listeners: {
                                                load : function(store,records,status) {                   
                                                    handleCapabilities(el.url,capsStore,function() {
                                                        status && records.forEach(function(rec){
                                                            if (rec.data.name == el.layername) {
                                                                layer.layerName = rec.data.title;
                                                                layer.record = rec.data;
                                                            
                                                            }
                                                            layer.layername = el.layername;
                                                            layer.record = layer.record || {};
                                                            layer.record.source  = "wms";   																											
                                                            layer.record.url  = el.url;   
                                                            layer.record.opacity = el.opacity;
                                                            layer.record.stylename = el.stylename;
                                                            layer.record.visible = el.visible;
                                                        });
                                                        layer.layerName = layer.layerName || "Информация о слое недоступна";
                                                        layers.add(layer);	
                                                    });                                                    
                                                }
                                            }
                                        });
                                    }, 20*idx);					
                                }
                                else if (el.source=="rss") {
                                    var found = rssStore.getRange().filter(function(elt){
                                        return elt.get('id')==parseInt(el.id)
                                    })[0];
                                    if (found) {
                                        layer.layerName = found.raw.title;
                                        layer.record = found.raw;
                                        layer.record.source  = "rss";
                                        layer.record.opacity = el.opacity;
                                        layer.record.stylename = el.stylename;
                                        layer.record.visible = el.visible;
                                    }
                                    layer.layerName = layer.layerName || "Информация о слое недоступна";
                                    layers.add(layer);	
                                } else if (el.source=="arcgis") {
                                    var found = arcgisStore.getRange().filter(function(elt){
                                        return elt.get('id')==parseInt(el.id)
                                    })[0] ;
                                    if (found) {
                                        layer.layerName = found.raw.title;
                                        layer.record = found.raw;
                                        layer.record.source  = "arcgis";
                                        layer.record.opacity = el.opacity;
                                        layer.record.stylename = el.stylename;
                                        layer.record.visible = el.visible;
                                    }
                                    layer.layerName = layer.layerName || "Информация о слое недоступна";
                                    layers.add(layer);	
                                } else if (el.source=="animation") {
                                    var found = animationStore.getRange().filter(function(elt){
                                        return elt.get('anim_id')==parseInt(el.id)
                                    })[0] ;
                                    if (found) {
                                        layer.layerName = found.raw.title;
                                        layer.record = found.raw;
                                        layer.record.source  = "animation";
                                        layer.record.opacity = el.opacity;
                                        layer.record.stylename = el.stylename;
                                        layer.record.visible = el.visible;
                                    }
                                    layer.layerName = layer.layerName || "Информация о слое недоступна";
                                    layers.add(layer);	
                                } else {
                                    Ext.getCmp("profilePanel").layersLeft-- ;
                                }
                            });
                        }
                        else {
                            this.setLoading(false);
                            Ext.getCmp('layersGrid').setViewDisabled(false);
                        }
                    //this.setViewDisabled(false);
                    }                    
                    catch(e){
                        this.setLoading(false);
                    }
                }
            },{
                xtype      : 'label',  
                html       : '&nbsp;',
                style      : 'font-size:20px;font-weight: bold'
            },{
                xtype      : 'tree',
                title      : 'Инструменты',
                name       : 'tools',
                height     : 250, 
                id         : 'toolsTree',
                autoScroll: true,
                rootVisible : false,
                root: {
                    nodeType: 'async',
                    expanded: true,
                    children: viewerTools
                },
                anchor     : "100%"                
            }]
        }
        ]
    }    
    ]
    
});




var askForDelete = function (id) {
    Ext.MessageBox.show({
        title: "Удаление профиля",
        msg: "Вы действительно хотите удалить выбранный профиль?",
        buttonText: {
            yes: "Да",
            no:  "Нет"
        },
        fn: function (btn){
            if(btn=='yes'){     
                removeProfile(id);                
            }
        }
    });
};
		

	
var editProfile = function (id) {
    profileEditor.showProfileWindow({
        layerId:id, 
        updateCallback: refreshGrid
    });
};		
		
var refreshGrid = function(cb) {
    profileStore.reload();
    cb && cb.call();
}
 
 
var getLayers = function() {
    var arr = layers.getRange();
    var resArr = [];
    var res = [];
    arr.forEach(function(el){
        resArr.push(el.data);
    });
    resArr.forEach(function(elem){
        var el = elem.record;
        var s = {
            id : el.id ? el.id : el.anim_id ? el.anim_id : el.gid ? el.gid : undefined,
            source : el.source,
            opacity: el.opacity,
            visible: el.visible,
            stylename: el.stylename
        }
        if (el.source=="wms") {
            s.url = el.url;
            s.layername = el.name;
        }
        res.push(s);
		
    });
    return res;
} 

var getTools = function() {
    var arr = Ext.getCmp('toolsTree').getChecked();
    var resArr = [];
    arr.forEach(function(el){
        resArr.push(el.raw.ptype)
    })
    return resArr;
} 

var getState = function(){
    var properties = [
    {
        key : "extent",
        value : Ext.getCmp('extentField').getValue()
    },
    {
        key : "projection",
        value : Ext.getCmp('projectionField').getValue()
    },
    {
        key : "basemap",
        value : Ext.getCmp('basemapField').getValue()
    },
    {
        key : "layers",
        value : JSON.stringify(getLayers())
    },
    {
        key : "tools",
        value : JSON.stringify(getTools())
    }
    ];
    var prop = [];
    properties.every(function(el){
        prop.push(el.key+"="+el.value);
        return true;
    });
    return {
        name : Ext.getCmp('profileNameField').getValue(),
        name_en : Ext.getCmp('profileNameEnField').getValue(),
        obj : "gis.map",
        owner: "commonprofile",//Ext.getCmp('ownerField').getValue(),
        prop: prop.join(";")        
    };   
}

var resetFields = function() {
    Ext.getCmp('editedProfileId').reset();
    Ext.getCmp('profileNameField').reset();
    Ext.getCmp('profileNameEnField').reset();
    Ext.getCmp('commonProfile').reset();
    Ext.getCmp('extentField').reset();
    Ext.getCmp('projectionField').reset();
    Ext.getCmp('basemapField').reset();
    Ext.getCmp('projectionField').setDisabled(true);
    Ext.getCmp('layersGrid').store.removeAll();
    Ext.getCmp('layersGrid').store.removeAll();                    
    Ext.getCmp('toolsTree').getRootNode().childNodes.every(function(el){
        el.set('checked',false);
        return true;
    });
    Ext.getCmp('layersGrid').gotLayers = [];
}

var saveProfile = function() {
    var state = getState();
    var id = Ext.getCmp('editedProfileId').getValue();
    OpenLayers.Request.issue({
        method: "POST",
        url: CONFIG.PROXY + CONFIG.REST_URL + ( id ? "/update/" + id + ".json" :"/add.json"),
        async: true,        
        data: OpenLayers.Util.getParameterString(state),        
        callback: function(request) 
        {					
            Ext.Msg.alert('Сохранение', 'Информация о профиле успешно сохранена');
            Ext.getCmp('profilePanel').items.getRange()[0].idToSelect = id;
            refreshGrid();            
        }					
    });    
}

var removeProfile = function(id) {    
    OpenLayers.Request.issue({
        method: "POST",
        url: CONFIG.PROXY + CONFIG.REST_URL + "/admin/delete/"+id+".json",
        async: true,        
        callback: function(request) 
        {					
            Ext.Msg.alert('Удаление', 'Профиль успешно удален');
            refreshGrid();
            resetFields();
        }					
    });   
}

var exportCSV = function() {
    var arr = profileStore.getRange();
    var csv = "data:text/csv;charset=utf-8,";
    arr.forEach(function(el){
        csv+=el.raw.profileId+";"+el.raw.profileName+";"+el.raw.profileOwner+";"+el.raw.dateCreate+";\n"
    });

    var encodedUri = encodeURI(csv);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "profiles.csv");
    link.click();
}