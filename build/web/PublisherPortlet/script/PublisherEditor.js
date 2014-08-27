Ext.define('Ext.gispro.PublisherEditor', {
    extend: 'Ext.panel.Panel',

    autoScroll  : true,
    defaults : {
        split: true
    },
    xtype: "publisherEditor",
    split: true,
    style: {
        "background": "white"
    },    
    items: [
    {
        xtype      : 'textfield',
        id	   : 'editedItemId',	
        hidden: true
    },{
        xtype      : 'checkbox',
        id	   : 'publishedonce',	
        hidden: true
    },{
        xtype       : 'fieldset',
        title       : 'Настройки сервиса',
        flex        : 1,
        //        autoScroll  : true,
        labelAlign  : 'top',
        anchor      : '100%',
        border      : 1,
        bodyStyle   : 'padding: 10px 10px 5px 10px;',
        style: {
            "margin-left": "10px",
            "margin-right": "10px",
            "background": "transparent"
        },      
        items: [
        {
            xtype      : 'combobox',
            fieldLabel : 'Ид. ресурса',
            name       : 'resourceid',
            id         : 'resourceid',	
            store      : resourcesStore,
            queryMode  : 'local',
            displayField: 'resourceid',
            valueField : 'resourceid',
            anchor     : "100%",
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
            caseSensitive: false,
            listeners : {
                select: function ( combo, records, eOpts ) {                    
                    setLayerName(Ext.getCmp('resourceid').getValue(), Ext.getCmp('param').getValue(), Ext.getCmp('type').getValue(), Ext.getCmp('title'));
                    setParamsList(Ext.getCmp('resourceid').getValue());
                    setWorkspace(Ext.getCmp('resourceid').getValue(), Ext.getCmp('workspace'));
                }
            }
        },{
            xtype      : 'textfield',
            fieldLabel : 'Рабочая область',
            name       : 'workspace',
            id         : 'workspace',	
            anchor     : "100%"
        },{
            xtype      : 'textfield',
            fieldLabel : 'Файл маски',
            name       : 'mask',
            id         : 'mask',	
            anchor     : "100%"
        }
        ]
    },{
        xtype       : 'fieldset',
        title       : 'Элемент',
        flex        : 1,
        //        autoScroll  : true,
        labelAlign  : 'top',
        anchor      : '100%',
        border      : 1,
        bodyStyle   : 'padding: 10px 10px 5px 10px;',
        style: {
            "margin-left": "10px",
            "margin-right": "10px",
            "background": "transparent"
        },      
        items: [
        {
            xtype      : 'combobox',
            fieldLabel : 'Тип геометрии',
            name       : 'type',
            id         : 'type',	
            anchor     : "100%",            
            store      : geomtypes,
            queryMode  : 'local',
            displayField: 'title',
            valueField : 'name',            
            listeners: {
                change: function( combo, newValue, oldValue, eOpts ){
                    Ext.getCmp('minlevel').setDisabled(newValue!="ln");
                    Ext.getCmp('maxlevel').setDisabled(newValue!="ln");
                    Ext.getCmp('param').setDisabled(newValue=="pt");
                    Ext.getCmp('step').setDisabled(newValue=="pt");
                    Ext.getCmp('cellsize').setDisabled(newValue=="pt");
                    Ext.getCmp('smooth').setDisabled(newValue=="pt");                    
                },
                select: function ( combo, records, eOpts ) {                    
                    setLayerName(Ext.getCmp('resourceid').getValue(), Ext.getCmp('param').getValue(), Ext.getCmp('type').getValue(), Ext.getCmp('title'));
                }
            }
        },{
            xtype      : 'combobox',
            fieldLabel : 'Параметр',
            name       : 'param',
            id         : 'param',	
            anchor     : "100%",
            store      : paramsStore,
            queryMode  : 'local',
            displayField: 'name',
            valueField : 'name',
            listeners : {
                select: function ( combo, records, eOpts ) {                    
                    setLayerName(Ext.getCmp('resourceid').getValue(), Ext.getCmp('param').getValue(), Ext.getCmp('type').getValue(), Ext.getCmp('title'));
                }
            }
        }
        ]
    },{
        xtype       : 'fieldset',
        title       : 'Настройки элемента',
        flex        : 1,
        //        autoScroll  : true,
        labelAlign  : 'top',
        anchor      : '100%',
        border      : 1,
        bodyStyle   : 'padding: 10px 10px 5px 10px;',
        style: {
            "margin-left": "10px",
            "margin-right": "10px",
            "background": "transparent"
        },      
        items: [
        {
            xtype      : 'textarea',
            fieldLabel : 'Заголовок',
            name       : 'title',
            id         : 'title',	
            anchor     : "100%"
        },{
            xtype      : 'combobox',
            fieldLabel : 'Стили',
            name       : 'styles',
            id         : 'styles',	
            store      : stylesStore,             
            queryMode  : 'local',
            displayField: 'name',
            valueField : 'name',
            anchor     : "100%",
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
            listeners: {
                select : function(){
                    if (!Ext.getCmp("defaultstyle").getValue()) {
                        Ext.getCmp("defaultstyle").setValue(Ext.getCmp("styles").getValue()[0]);
                    }
                }
            },
            anyMatch: true,
            multiSelect: true,
            caseSensitive: false            
        },{
            xtype      : 'combobox',
            fieldLabel : 'Стиль по умолчанию',
            name       : 'defaultstyle',
            id         : 'defaultstyle',	
            anchor     : "100%",
            displayField: 'name',
            valueField : 'name',
            store      : defaultStyleStore,             
            queryMode  : 'local',
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
        },{
            xtype      : 'numberfield',
            fieldLabel : 'Шаг изолинии',
            name       : 'step',
            id         : 'step',	
            anchor     : "100%",
            allowDecimals: true,
            step       : 1,
            value      : 1,
            hideTrigger: false
        },{
            xtype      : 'numberfield',
            fieldLabel : 'Размер ячейки',
            name       : 'cellsize',
            id         : 'cellsize',	
            anchor     : "100%",
            allowDecimals: true,
            step       : 0.1,
            value      : 0.1,
            hideTrigger: false
        },{
            xtype      : 'numberfield',
            fieldLabel : 'Мин.уровень',
            disabled   : true,
            name       : 'minlevel',
            id         : 'minlevel',	
            anchor     : "100%",
            allowDecimals: false,
            step       : 1,
            value      : 2,
            hideTrigger: false
        },{
            xtype      : 'numberfield',
            fieldLabel : 'Макс.уровень',
            disabled   : true,
            name       : 'maxlevel',
            id         : 'maxlevel',	
            anchor     : "100%",
            allowDecimals: false,
            step       : 1,
            value      : 3,
            hideTrigger: false
        },{
            xtype      : 'checkbox',
            fieldLabel : 'Строить кэш',
            checked    : false,
            name       : 'seed',
            id         : 'seed',	
            anchor     : "100%",
            listeners  : {
                change: function (el, newValue, oldValue, eOpts) {
                    Ext.getCmp('cachestart').setVisible(newValue);
                    Ext.getCmp('cachestop').setVisible(newValue);
                }
            }
        },{
            xtype      : 'numberfield',
            fieldLabel : 'Нач. зум кэша',
            hidden     : true,
            name       : 'cachestart',
            id         : 'cachestart',	
            anchor     : "100%",
            allowDecimals: false,
            step       : 1,
            value      : 2,
            hideTrigger: false
        },{
            xtype      : 'numberfield',
            fieldLabel : 'Кон. зум кэша',
            hidden     : true,
            name       : 'cachestop',
            id         : 'cachestop',	
            anchor     : "100%",
            allowDecimals: false,
            step       : 1,
            value      : 3,
            hideTrigger: false
        },{
            xtype      : 'checkbox',
            fieldLabel : 'Сглаживание',
            name       : 'smooth',
            id         : 'smooth',	
            anchor     : "100%"
        }
        ]
    },{
        xtype       : 'fieldset',
        title       : 'Информация о записи',
        flex        : 1,
        //        autoScroll  : true,
        labelAlign  : 'top',
        anchor      : '100%',
        border      : 1,
        bodyStyle   : 'padding: 10px 10px 5px 10px;',
        style: {
            "margin-left": "10px",
            "margin-right": "5px",
            "background": "transparent"
        },      
        items: [
        {
            xtype      : 'textfield',
            fieldLabel : 'Создал',
            disabled   : 'true',
            name       : 'user_created',
            id         : 'user_created',	
            anchor     : "100%"
        },{
            xtype      : 'textfield',
            fieldLabel : 'Дата создания',
            disabled   : 'true',
            name       : 'date_created',
            id         : 'date_created',	
            anchor     : "100%"
        },{
            xtype      : 'textfield',
            fieldLabel : 'Изменил',
            disabled   : 'true',
            name       : 'user_modified',
            id         : 'user_modified',	
            anchor     : "100%"
        },{
            xtype      : 'textfield',
            fieldLabel : 'Дата изменения',
            disabled   : 'true',
            name       : 'date_modified',
            id         : 'date_modified',	
            anchor     : "100%"
        }
        ]
    }],
    reset : function() {
        this.items.getRange().forEach(function(el){
            if (el.reset) el.reset();
            else {
                el.items.getRange().forEach(function(elem){
                    elem.reset()
                })
            }
        });
        Ext.getCmp("type").select("pt");
    },
    getState: function() {
        var res = {};
        this.items.getRange().forEach(function(el){
            if (el.getValue && el.reset) res[el.getId()] = el.getValue();
            else {
                el.items.getRange().forEach(function(elem){
                    res[elem.getId()] = typeof (elem.getValue()) == "boolean" ? elem.getValue().toString() : typeof (elem.getValue()) == "number" ? elem.getValue() : (elem.getValue() || "");
                })
            }
        })
        res.minlevel = res.minlevel || 0;
        res.maxlevel = res.maxlevel || 0;
        res.step = res.step || 0;
        if (Ext.getCmp("type").getValue()!="ln") {
            delete (res.step);
            delete (res.maxlevel);
            delete (res.minlevel);
        }        
        delete (res.editedItemId);
        delete (res.date_created);
        delete (res.date_modified);
        delete (res.user_created);
        delete (res.user_modified);
        delete (res.publishedonce);
        res.user = window.JOSSO_USER;
        res.action = "builddata,publishlayer,truncatecache";
        return res;
    },
    populate: function(rec) {
        for (var i in rec) {
            var c = Ext.getCmp(i);
            if (c instanceof Ext.form.Checkbox) {                
                c && c.setValue(rec[i]=='t')
            } else if (c instanceof Ext.form.ComboBox) {
                if (i=="styles") {
                    c && c.select(rec[i].replace(/ /g, "").split(","));
                } else {
                    c && c.select(rec[i]);
                }
            } else {
                c && c.setValue(rec[i]);
            }
        }
        Ext.getCmp('editedItemId').setValue(rec["id"]);
    },
    getRecordId: function() {
        return Ext.getCmp('editedItemId').getValue();
    },
    getResourceid: function() {
        return Ext.getCmp('resourceid').getValue();
    },
    getType: function() {
        return Ext.getCmp('type').getValue();
    },
    getParam: function() {
        return Ext.getCmp('param').getValue();
    }
});

