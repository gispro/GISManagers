Ext.define('capsModel', {
    extend: 'Ext.data.Model',
//    fields: ["gid", "nodename", "resourceid", "layername", "stylename","serverpath", "servicepath", "workspace", "x_axis"]
    fields: ["gid", "nodename", "resourceid", "layername", "stylename","url", "workspace", "x_axis"]
});

Ext.define('wmsModel', {
    extend: 'Ext.data.Model',
    fields: ["id", "url", "workspace","rest_url", "server_name", "user_created", "user_modified", "date_created", "date_modified","registered","active","srbd_id"]
});

wmsStore = Ext.create('Ext.data.Store', {
    model: 'wmsModel',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        pageParam: false,
        startParam: false,
        limitParam: false,
        url:  CONFIG.PROXY + CONFIG.OVROOT+'services?service=wms&action=getList',
        reader: {
            type: 'json',
            root: 'services'
        }
    }
});


Ext.define('rssModel', {
    extend: 'Ext.data.Model',
    fields: ["id", "url", "title", "icon", "name", "access", "user_created", "user_modified", "date_created", "date_modified"]
});

rssStore = Ext.create('Ext.data.Store', {
    model: 'rssModel',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        pageParam: false,
        startParam: false,
        limitParam: false,
        url:  CONFIG.PROXY + CONFIG.OVROOT+'services?service=rss&action=getList',
        reader: {
            type: 'json',
            root: 'services'
        }
    }
});



Ext.define('arcgisModel', {
    extend: 'Ext.data.Model',
    fields: ["id", "url", "title", "format", "user_created", "user_modified", "date_created", "date_modified"]
});

arcgisStore = Ext.create('Ext.data.Store', {
    model: 'arcgisModel',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        pageParam: false,
        startParam: false,
        limitParam: false,
        url:  CONFIG.PROXY + CONFIG.OVROOT+'services?service=arcgis&action=getList',
        reader: {
            type: 'json',
            root: 'servers'
        }
    }
});


Ext.define('animModel', {
    extend: 'Ext.data.Model',
    fields: ['anim_id','name', 'url', 'title', 'x_axis', 'layers' ]
});

animationStore = Ext.create('Ext.data.Store', {
    model: 'animModel',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        pageParam: false,
        startParam: false,
        limitParam: false,
        url:  CONFIG.PROXY + CONFIG.OVROOT+'services?service=animation&action=getList',
        reader: {
            type: 'json',
            root: 'layers'
        }
    }
});



var formats = Ext.create('Ext.data.Store', {
    fields: ['display', 'value'],
    data : [
    {
        "display":"PNG", 
        "value":"image/png"
    },
    {
        "display":"JPEG", 
        "value":"image/jpeg"
    }
    ]
});