Ext.define('chartsModel', {
    extend: 'Ext.data.Model',
    fields: ["chart_id", "url", "is_default", "title", "layers", "x_axis", "y_axis", "user_created", "user_modified", "date_created", "date_modified"]
});

chartStore = Ext.create('Ext.data.Store', {
    model: 'chartsModel',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        pageParam: false,
        startParam: false,
        limitParam: false,
        url:  CONFIG.PROXY + CONFIG.OVROOT+'services?service=charts&action=getList',
        reader: {
            type: 'json',
            root: 'charts'
        }
    }
});

