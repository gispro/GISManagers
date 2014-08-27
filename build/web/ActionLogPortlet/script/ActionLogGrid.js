Ext.require('Ext.ux.grid.FiltersFeature');

//Ext.ux.grid.FiltersFeature.prototype.menuFilterText = "Фильтры";

var filters = {
    ftype: 'filters',
    local: false
};

Ext.define('Ext.gispro.ActionLogGrid', {
    extend: 'Ext.grid.GridPanel',
    xtype: 'actionLogGrid',
    store: actionLogStore,
    id: 'actionLogGrid',
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
        header: "Дата", 
        dataIndex: "datetime", 
        flex: 3,
        sortable: true,
        filterable: true,
        filter: {type: 'string'}
    },
    {
        header: "Пользователь", 
        flex: 5,
        dataIndex: "login", 
        sortable: true,
        filterable: true,
        filter: {type: 'string'}
    },{  header: "Сообщение", 
        flex: 5,
        dataIndex: "message", 
        sortable: true,
        filterable: true,
        filter: {type: 'string'}
    }
    ],
    dockedItems: [{
        xtype: 'pagingtoolbar',
        store: actionLogStore,
        dock: 'bottom'
    }],
    getSelectedRecord: function (){
        return this.getSelectionModel().getSelection()[0];
    }
});
