Ext.define('wmsModel', {
    extend: 'Ext.data.Model',
    fields: ['anim_id','name', 'url', 'server_name', 'x_axis', 'layers' ]
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
