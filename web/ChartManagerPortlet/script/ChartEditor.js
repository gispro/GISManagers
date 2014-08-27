Ext.require([
    'Ext.data.writer.Json',
    'GeoExt.data.reader.WmsCapabilities',
    'GeoExt.data.WmsCapabilitiesLayerStore'
    ]);


var fieldXStore = Ext.create('Ext.data.Store', {
    fields: [{
        name: 'id', 
        type: 'string'
    },{
        name: 'name',  
        type: 'string'
    }],
    data: [
            
]
}); 

var fieldYStore = Ext.create('Ext.data.Store', {
    fields: [{
        name: 'id', 
        type: 'string'
    },{
        name: 'name',  
        type: 'string'
    }],
    data: [
            
]
}); 

Ext.define('capsModel', {
    extend: 'Ext.data.Model',
    //    fields: ["gid", "nodename", "resourceid", "layername", "stylename","serverpath", "servicepath", "workspace", "x_axis"]
    fields: ["gid", "nodename", "resourceid", "layername", "stylename","url", "workspace", "x_axis"]
});

Ext.define('Ext.gispro.ChartEditor', {
    extend: 'Ext.panel.Panel',
    layout: {
        type:'border', 
        align:'stretch'        
    },
    defaults: {
        split: true
    },
    xtype: "chartEditor",
    split: true,
    tbar: [
    new Ext.Toolbar.TextItem({
        text: "Наименование: "
    }),
    {
        xtype: "textfield",
        flex: 2,
        minWidth: 95
    },
    new Ext.Toolbar.TextItem({
        text: "Геосервис: ",
        value: 0
    }),    
    new Ext.form.ComboBox({
        store: wmsStore,
        minWidth: 95,
        valueField: "id",
        displayField: "server_name",
        triggerAction: "all",
        forceSelection: true,
        mode: "local",
        flex: 3,
        listeners: {
            select: function(combo, records, index)
            {
                var source = wmsStore.getById(combo.getValue());               
                combo.up('.panel').items.items[0]
                editor.setLoading(true);
                var capsStore = new GeoExt.data.WmsCapabilitiesStore({
                    url: CONFIG.PROXY_REMOTE + source.raw.url + "/wms?service=wms&version=1.3.0&request=getcapabilities",
                    autoLoad : true,
                    listeners: {
                        load : function(store,records,status) {                   
                            handleCapabilities(source.raw.url,capsStore,function(){
                                editor.setLoading(false);
                                if (records.length!=0) {
                                    records.forEach(function(record){
                                        record.set('layername', record.get('name'));
                                        record.set('nodename', record.get('title'));
                                    });
                                }
                                combo.up('.panel').items.items[0].getStore().loadData(capsStore.getRange());
                                combo.up('.panel').items.items[0].getView().focusRow(0);
                                if (combo.populateCallback) {
                                    combo.populateCallback.call(this);
                                }
                            });
                        }
                    }
                });
            }
        }
    }),
    "->",
    new Ext.Toolbar.TextItem({
        text: "Ось X"
    }),
    new Ext.form.ComboBox({
        fieldId: "fieldX",
        flex: 1,
        store: fieldXStore,
        queryMode:'local',
        editable: false,
        valueField: "id",
        displayField: "name",
        triggerAction: 'all',
        minWidth: 95
    }),
    new Ext.Toolbar.TextItem({
        text: "Ось Y"
    }),
    new Ext.form.ComboBox({
        fieldId: "fieldY",
        flex: 1,
        store: fieldYStore,
        queryMode:'local',
        editable: false,
        valueField: "id",
        displayField: "name",
        triggerAction: 'all',
        minWidth: 95
    })
    ],
    items: [{
        autoScroll: true,
        title: "Доступные слои",
        xtype: 'grid',
        store : Ext.create('Ext.data.Store', {
            model: 'capsModel'
        }),
        flex: 1,        
        region: "center",
        autoExpandColumn: "title",
        columns: [
        {
            header: "Наименование", 
            dataIndex: "nodename",
            flex: 3,
            sortable: true
        },       
        {
            // this action column allow to include chosen layer to chart
            header: "Действия",
            xtype:'actioncolumn',
            flex: 1,
            items: [{
                iconCls: "gxp-icon-add",	//	new class in all.css
                tooltip: "Добавить",
                handler: function(grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    var store = grid.up('.panel').ownerCt.items.items[2].getStore();
                    store.add({
                        title: rec.get('nodename'),
                        nodename: rec.get('nodename'),
                        layername: rec.get('layername'),
                        name: rec.get('name'),
                        x_axis: store.getCount()+1,
                        server: grid.up('.panel').ownerCt.dockedItems.items[0].items.items[3].valueModels[0].raw.url
                    });
                    store.commitChanges();
                }              
            }]
        }
        ]
    }, {
        title:'Выбранные слои',
        xtype: 'grid',
        region: "south",
        store : Ext.create('Ext.data.Store', {
            model: 'capsModel',
            listeners: {
                add : function(a,b,c) {
                    if (c==0) {
                        axisParser.describeFeatureType(b[0].raw.server.replace("wms","wfs"), b[0].raw.layername);
                    }
                },
                remove : function(a,b,c) {
                    if (c==0 && a.getRange()[0]) {
                        axisParser.describeFeatureType(a.getRange()[0].raw.server.replace("wms","wfs"), a.getRange()[0].raw.layername);
                    }
                }
            }
        }),
        flex:1,
        columns: [
        {
            header: "Наименование", 
            dataIndex: "nodename",
            flex: 3,
            sortable: true
        },            
        {
            // this action column allow to include chosen layer to chart
            header: "Действия",
            xtype:'actioncolumn',
            flex: 1,
            items: [{
                // exclude layer from chart
                iconCls: "gxp-icon-delete",
                tooltip: this.excludeBtnText,
                handler: function(grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    var store = grid.getStore();
                    store.remove(rec);
                }
            },
            {
                // manage layers order
                iconCls: "gxp-icon-moveup",
                tooltip: this.moveUpBtnText,
                handler: function(grid, rowIndex, colIndex) {
                    var record = grid.getStore().getAt(rowIndex);
                    moveRecord(record,grid.getStore(),true);
                }
            },
            {
                // manage layers order
                iconCls: "gxp-icon-movedown",
                tooltip: this.moveDownBtnText,
                handler: function(grid, rowIndex, colIndex) {
                    var record = grid.getStore().getAt(rowIndex);
                    moveRecord(record,grid.getStore(),false);									
                }
            }
            ]
        }
        ]
    }],
    reset : function() {
        var tbar = this.dockedItems.items[0].items.items;
        this.dockedItems.items[0].items.items[1].reset();
        this.dockedItems.items[0].items.items[3].reset();
        tbar[tbar.length-3].reset();
        tbar[tbar.length-1].reset();
        tbar[tbar.length-3].getStore().removeAll();
        tbar[tbar.length-1].getStore().removeAll();
        this.items.items[0].store.removeAll();
        this.items.items[2].store.removeAll();
    },
    getState: function() {
        var tbar = this.dockedItems.items[0].items.items;
        var layersArr = new Array();        
        if (!checkFields.call(this, getLayers.call(this,layersArr))) return;
        var sourceComboBox = this.dockedItems.items[0].items.items[3];
        var sourceComboBoxValue = sourceComboBox.getStore().getById(sourceComboBox.getValue());
        var record = {
            user: window.JOSSO_USER,
            url: sourceComboBoxValue ? sourceComboBoxValue.raw.url : "",
            title: this.dockedItems.items[0].items.items[1].getValue(),	
            x_axis: tbar[tbar.length-3].getValue(),
            y_axis: tbar[tbar.length-1].getValue(),
            layers: layersArr
        }
        return record;	
    },
    populate: function(rec) {
        var tbar = this.dockedItems.items[0].items.items;
        tbar[1].setValue(rec.title);
        tbar[tbar.length-3].setValue(rec.x_axis);
        tbar[tbar.length-1].setValue(rec.y_axis);
        var combo = this.dockedItems.items[0].items.items[3];
        var me = this;
        combo.populateCallback = function() {
            var range = me.items.items[0].getStore().getRange();
            var store = me.items.items[2].getStore();
            store.removeAll();
            rec.layers.every(function(e,i){
                var arr = range.filter(function(el){
                    return el.data.layername==e
                })
                if (arr.length==0) return true;
                var r = arr[0];
                store.add({
                    title: r.get('nodename'),
                    nodename: r.get('nodename'),
                    layername: r.get('layername'),
                    //                    x_axis: rec.x_axis[i],
                    server: combo.valueModels[0].raw.url
                });                                
                return true;
            });
            store.commitChanges();
        }
        var foundrec = combo.getStore().getRange().filter(function(el){
            return el.raw.url==rec.url.split("?")[0]
        })[0];
        if (foundrec){
            combo.select(foundrec.raw.id);
            combo.fireEvent("select", combo, combo.getStore().getById(combo.getValue()));        
        }                      
    }
});


var moveRecord = function (record, store, up) {
    if (!record) {
        return;
    }
    var index = store.indexOf(record);
    if (up) {
        index--;
        if (index <0) {
            return;
        }									
    }
    else
    {
        index++;
        if (index >= store.getCount()) {
            return;
        }									
    }
    // change records order
    store.remove(record);
    store.insert(index, record);
}


var checkFields  = function (b, sc) {
    var res = true;
    //            if (chartName.getValue()!="") {
    //                if (chartLayersPanel.getStore().getCount()>0) {
    //                    if (!b) {
    //                        Ext.Msg.alert(this.errorTitleText, this.xaxisRequiredErrorText);
    //                        res = false;
    //                    }
    //                }
    //                else {
    //                    Ext.Msg.alert(this.errorTitleText, this.layersRequiredErrorText);
    //                    res = false;
    //                }
    //            }
    //            else {
    if (this.dockedItems.items[0].items.items[1].getValue()=="") {
        Ext.Msg.alert("Ошибка", "Не заполнено наименование");
        res = false;
    }
    return res;
};

var getLayers = function (layersArr){
    var store = this.items.items[2].getStore();	
    var valid = true;	// is x_axis not null?
    store.each(
        function(record){
            layersArr.push(record.data.layername);
        });
    return valid;
};