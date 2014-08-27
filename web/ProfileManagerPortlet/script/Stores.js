Ext.define('capsModel', {
    extend: 'Ext.data.Model',
    //    fields: ["gid", "nodename", "resourceid", "layername", "stylename","serverpath", "servicepath", "workspace", "x_axis"]
    fields: ["gid", "nodename", "resourceid", "layername", "stylename","url", "workspace", "x_axis"]
});

Ext.define('profileModel', {
    extend: 'Ext.data.Model',
    fields: ['dateCreate', 'profileId', 'profileName', 'profileObject', 'profileOwner', 'status']
});

profileStore = Ext.create('Ext.data.Store', {
    model: 'profileModel',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        pageParam: false, //to remove param "page"
        startParam: false, //to remove param "start"
        limitParam: false, //to remove param "limit"
        noCache: false, //to remove param "_dc"
        url:  CONFIG.PROXY_REMOTE + CONFIG.REST_URL + '/list.json?obj=gis.map&owner=commonprofile',
        reader: {
            type: 'json',
            root: 'description'
        }
    }, 
    listeners : {
        load : function(store,records,status) {            
            if (records)  for(var i=0;i < records.length;i++) {
                records[i].set('dateCreate', new Date(records[i].get('dateCreate')).toLocaleString() );                
            }            
            var grid = Ext.getCmp('profilePanel') && Ext.getCmp('profilePanel').items.getRange()[0];
            grid && grid.selModel.select(grid.getStore().getRange().filter(function(el){
                return el.data.profileId==grid.idToSelect;
            })[0]);
        }
    }
});


Ext.define('wmsModel', {
    extend: 'Ext.data.Model',
    fields: ['name', 'url', 'workspace', 'server_name', 'x_axis', 'layers', 'rest_url', "user_created", "user_modified", "date_created", "date_modified" ]
});

wmsStore = Ext.create('Ext.data.Store', {
    model: 'wmsModel',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        pageParam: false, //to remove param "page"
        startParam: false, //to remove param "start"
        limitParam: false, //to remove param "limit"
        noCache: false, //to remove param "_dc"
        url:  CONFIG.PROXY + CONFIG.OVROOT+'services?service=wms&action=getActive',
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
        pageParam: false, //to remove param "page"
        startParam: false, //to remove param "start"
        limitParam: false, //to remove param "limit"
        noCache: false, //to remove param "_dc"
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
        pageParam: false, //to remove param "page"
        startParam: false, //to remove param "start"
        limitParam: false, //to remove param "limit"
        noCache: false, //to remove param "_dc"
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
        pageParam: false, //to remove param "page"
        startParam: false, //to remove param "start"
        limitParam: false, //to remove param "limit"
        noCache: false, //to remove param "_dc"
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


Ext.define('styleModel', {
    extend: 'Ext.data.Model',
    fields: ['name','href']
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