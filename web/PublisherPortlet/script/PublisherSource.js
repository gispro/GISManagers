Ext.define('publModel', {
    extend: 'Ext.data.Model',
    fields: ["id", 'resourceid', 'param', 'type', 'title', 'defaultstyle', 'styles', 'step', 'minlevel', 'maxlevel', 'seed', 'cachestart', 'cachestop', 'smooth', 'cellsize', 'mask', 'user_created', 'date_created', 'user_modified', 'date_modified', 'action', 'workspace', 'publishedonce']
});

publisherStore = Ext.create('Ext.data.Store', {
    model: 'publModel',
    autoLoad: true,
    remoteSort: true,
    remoteFilter: true,
    sortOnLoad: true,
    sorters: {
        property : 'resourceid',
        direction: 'ASC',
        transform: function(val) {
            return val.toLowerCase();
        }
    },
    proxy: {
        type: 'ajax',
        url:  CONFIG.PROXY + CONFIG.OVROOT+'services?service=publisher&action=getList',
        reader: {
            type: 'json',
            root: 'items',
            totalProperty: 'total'
        }
    }
});

Ext.define('resModel', {
    extend: 'Ext.data.Model',
    fields: ['resourceid']
});

resourcesStore = Ext.create('Ext.data.Store', {
    model: 'resModel',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        url:  CONFIG.PROXY + CONFIG.OVROOT+'services?service=publisher&action=getResources',
        reader: {
            type: 'json',
            root: 'resources'
        }
    },
    listeners : {
        load : function () {
            this.sort({
                property : 'resourceid',
                direction: 'ASC',
                transform: function(val) {
                    return val.toLowerCase();
                }
            });
        }
    }
});

Ext.define('styleModel', {
    extend: 'Ext.data.Model',
    fields: ['name','href']
});

stylesStore = Ext.create('Ext.data.Store', {
    model: 'styleModel',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        pageParam: false, //to remove param "page"
        startParam: false, //to remove param "start"
        limitParam: false, //to remove param "limit"
        noCache: false, //to remove param "_dc"
        url:  CONFIG.PROXY_REMOTE + CONFIG.GEOSERVER+'/rest/styles.json',
        reader: {
            type: 'json',
            root: 'styles.style'
        }
    },
    listeners : {
        load : function () {
            this.sort({
                property : 'name',
                direction: 'ASC',
                transform: function(val) {
                    return val.toLowerCase();
                }
            });
        }
    }
});

defaultStyleStore = Ext.create('Ext.data.Store', {
    model: 'styleModel',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        pageParam: false, //to remove param "page"
        startParam: false, //to remove param "start"
        limitParam: false, //to remove param "limit"
        noCache: false, //to remove param "_dc"
        url:  CONFIG.PROXY_REMOTE + CONFIG.GEOSERVER+'/rest/styles.json',
        reader: {
            type: 'json',
            root: 'styles.style'
        }
    },
    listeners : {
        load : function () {
            this.sort({
                property : 'name',
                direction: 'ASC',
                transform: function(val) {
                    return val.toLowerCase();
                }
            });
        }
    }
});

geomtypes = Ext.create('Ext.data.Store', {
    fields: ['title', 'name'],
    data : [
    {
        "title":"Точки", 
        "name":"pt"
    },

//    {
//        "title":"Полигоны", 
//        "name":"pl"
//    },

    {
        "title":"Изолинии", 
        "name":"ln"
    },

    {
        "title":"Поверхность", 
        "name":"sf"
    }        
    ]
});


paramsStore = Ext.create('Ext.data.Store', {
    fields: ['name'],
    data : [ ]
});