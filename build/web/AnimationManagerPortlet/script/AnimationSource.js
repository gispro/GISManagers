Ext.define('animModel', {
    extend: 'Ext.data.Model',
    fields: ['anim_id','name', 'url', 'title', 'x_axis', 'layers' , "user_created", "user_modified", "date_created", "date_modified" ]
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

