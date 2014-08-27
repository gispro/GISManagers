Ext.define('processLogModel', {
    extend: 'Ext.data.Model',
    //fields: ["id", 'starttime', 'stoptime', 'resourceid', 'processid', 'loglevel', 'exitcode', 'message']
    fields: ["id", 'datestart', 'datestop', 'resourceid', 'processid', 'stageid', 'param', 'loglevel', 'message']
});

processLogStore = Ext.create('Ext.data.Store', {
    model: 'processLogModel',
    pageSize: 50,
    remoteSort: true,
    remoteFilter: true,
    sortOnLoad: true,
    sorters: {
        property : 'datestart',
        direction: 'DESC'
    },
    autoLoad: true,
    proxy: {
        type: 'ajax',
        url:  CONFIG.PROXY + CONFIG.OVROOT+'services?service=processLog&action=getList',
        reader: {
            type: 'json',
            root: 'items',
            totalProperty: 'total'
        }
    }
});

