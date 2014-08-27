Ext.define('actionLogModel', {
    extend: 'Ext.data.Model',
    fields: ["id", 'datetime', 'login', 'message']
});

actionLogStore = Ext.create('Ext.data.Store', {
    model: 'actionLogModel',
    autoLoad: true,
    remoteSort: true,
    remoteFilter: true,
    sortOnLoad: true,
    sorters: {
        property : 'datetime',
        direction: 'DESC'
    },
    proxy: {
        type: 'ajax',
        url:  CONFIG.PROXY + CONFIG.OVROOT+'services?service=actionLog&action=getList',
        reader: {
            type: 'json',
            root: 'items',
            totalProperty: 'total'
        }
    }
});

