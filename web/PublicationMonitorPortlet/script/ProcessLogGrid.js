Ext.require('Ext.ux.grid.FiltersFeature');

//Ext.ux.grid.FiltersFeature.prototype.menuFilterText = "Фильтры";

var filters = {
    ftype: 'filters',
    local: false
};
//fields: ["id", 'datestart', 'datestop', 'resourceid', 'processid', 'stageid', 'param', 'loglevel', 'message'], 
Ext.define('Ext.gispro.ProcessLogGrid', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'processLogGrid',
    store: processLogStore,    
    autoScroll: true,
    features: [filters],  
//    tbar: [{
//        text: "Обновить",
//        handler: function() {
//            this.up(".grid").getStore().reload();
//        }
//    }],
    columns:[
    {
        header: "ID ресурса", 
        flex: 5,
        dataIndex: "resourceid", 
        sortable: true,
        filterable: true,
        filter: {type: 'string'}
    },{
        header: "Параметр", 
        flex: 5,
        dataIndex: "param", 
        sortable: true,
        filterable: true,
        filter: {type: 'string'}
    },{
        header: "Сообщение", 
        flex: 17,
        dataIndex: "message", 
        sortable: true,
        filterable: true,
        filter: {type: 'string'}
    },{
        header: "Дата начала", 
        dataIndex: "datestart", 
        flex: 3,
        sortable: true,
        filterable: true,
        filter: {type: 'string'}
    },
    {
        header: "Дата окончания", 
        flex: 5,
        dataIndex: "datestop", 
        sortable: true,
        filterable: true,
        filter: {type: 'string'}
    },
    {
        header: "ID процесса", 
        flex: 5,      
        dataIndex: "processid", 
        sortable: true,
        filterable: true,
        filter: {type: 'string'}
    },{
        header: "Стадия", 
        flex: 5,
        dataIndex: "stageid", 
        sortable: true,
        filterable: true,
        filter: {type: 'string'}
    },{
        header: "Уровень логирования", 
        flex: 5,
        dataIndex: "loglevel", 
        sortable: true,
        filterable: true,
        filter: {type: 'string'}
    }
    ],
    dockedItems: [{
        xtype: 'pagingtoolbar',
        store: processLogStore,
        dock: 'bottom'
    }],
    getSelectedRecord: function (){
        return this.getSelectionModel().getSelection()[0];
    }
});
